package com.jobportal.kaamsathi.auth.service;

import java.util.List;
import com.jobportal.kaamsathi.auth.dto.InvitePreviewResponse;
import com.jobportal.kaamsathi.auth.dto.InviteResponse;
import com.jobportal.kaamsathi.auth.dto.UserResponse;
import com.jobportal.kaamsathi.auth.event.RecruiterInvited;
import com.jobportal.kaamsathi.auth.entity.InviteStatus;
import com.jobportal.kaamsathi.auth.entity.RecruiterInvite;
import com.jobportal.kaamsathi.auth.entity.User;
import com.jobportal.kaamsathi.auth.entity.UserStatus;
import com.jobportal.kaamsathi.auth.repository.RecruiterInviteRepository;
import com.jobportal.kaamsathi.auth.repository.UserRepository;
import com.jobportal.kaamsathi.common.exception.ApiException;
import com.jobportal.kaamsathi.common.exception.ErrorCode;
import com.jobportal.kaamsathi.common.security.Role;
import com.jobportal.kaamsathi.common.util.SecureTokens;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

/**
 * Recruiter invites: the owner invites by email; the recruiter opens the link, sets a password,
 * and becomes a RECRUITER of the owner's company.
 */
@Service
public class InviteService {

    private static final Duration INVITE_TTL = Duration.ofDays(7);

    private final RecruiterInviteRepository inviteRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CompanyVerificationCheck companyCheck;   // implemented by the company module
    private final CompanyNameLookup companyNames;          // implemented by the company module
    private final RecruiterSeatLimit seatLimit;            // implemented by the payment module
    private final ApplicationEventPublisher events;
    private final Clock clock;
    private final String frontendUrl;

    public InviteService(RecruiterInviteRepository inviteRepository, UserRepository userRepository,
                         PasswordEncoder passwordEncoder, CompanyVerificationCheck companyCheck,
                         CompanyNameLookup companyNames,
                         RecruiterSeatLimit seatLimit, ApplicationEventPublisher events, Clock clock,
                         @Value("${app.frontend-url}") String frontendUrl) {
        this.events = events;
        this.inviteRepository = inviteRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.companyCheck = companyCheck;
        this.companyNames = companyNames;
        this.seatLimit = seatLimit;
        this.clock = clock;
        this.frontendUrl = frontendUrl;
    }

    /** What invite() gives back: the reply JSON + the plain token (ONLY for the dev header). */
    public record InviteResult(InviteResponse invite, String token) {
    }

    /**
     * Owner invites a recruiter. Owner must have a company, else 409 COMPANY_REQUIRED;
     * it must be VERIFIED, else 409 COMPANY_NOT_VERIFIED.
     * Seats full (recruiters + open invites ≥ limit; free 1, plan = its seats) → 409 RECRUITER_SEATS_FULL.
     * Email already has an account → 409. Link valid 7 days, logged to the console for now.
     */
    @Transactional
    public InviteResult invite(UUID ownerId, String rawEmail) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_TOKEN));
        // read companyId from the DB, not the token: the DB is always up to date
        if (owner.getCompanyId() == null) {
            throw new ApiException(ErrorCode.COMPANY_REQUIRED);
        }
        // a company still PENDING / REJECTED can't build a team yet
        if (!companyCheck.isVerified(owner.getCompanyId())) {
            throw new ApiException(ErrorCode.COMPANY_NOT_VERIFIED);
        }

        // seats: an open invite holds a seat too (else the owner could send 10 invites on a 1-seat plan)
        Instant now = Instant.now(clock);
        UUID companyId = owner.getCompanyId();
        long used = userRepository.countByCompanyIdAndRole(companyId, Role.RECRUITER)
                + inviteRepository.countByCompanyIdAndStatusAndExpiresAtAfter(companyId, InviteStatus.PENDING, now);
        if (used >= seatLimit.seatLimit(companyId)) {
            throw new ApiException(ErrorCode.RECRUITER_SEATS_FULL);
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        String token = SecureTokens.newToken();
        RecruiterInvite invite = inviteRepository.save(new RecruiterInvite(
                UUID.randomUUID(), email, owner.getCompanyId(), owner.getId(),
                SecureTokens.sha256(token), now.plus(INVITE_TTL), now));

        // email goes out AFTER commit (notification module listens); no email if this transaction fails
        events.publishEvent(new RecruiterInvited(email, frontendUrl + "/accept-invite?token=" + token));
        return new InviteResult(InviteResponse.from(invite), token);
    }

    /**
     * Recruiter opens the link and sets a password → new RECRUITER user in the invite's company.
     * ACTIVE at once (the link came by email, so the email is proven).
     * Unknown / used / expired → 400 INVALID_LINK. Email taken meanwhile → 409.
     */
    @Transactional
    public UserResponse accept(String token, String password) {
        Instant now = Instant.now(clock);
        RecruiterInvite invite = inviteRepository.findByTokenHash(SecureTokens.sha256(token))
                .filter(i -> i.isUsable(now))
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_LINK));

        if (userRepository.existsByEmail(invite.getEmail())) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User recruiter = new User(
                UUID.randomUUID(),
                invite.getEmail(),
                passwordEncoder.encode(password),
                Role.RECRUITER,
                UserStatus.ACTIVE,
                invite.getCompanyId(),
                now,                    // consent given now (DPDP)
                now);
        try {
            userRepository.saveAndFlush(recruiter);
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_EXISTS);   // same email signed up at the same moment
        }

        invite.accept(now);   // single use; saved by dirty checking
        return UserResponse.from(recruiter);
    }

    /**
     * Read an invite BEFORE accepting it (public; the token is the proof).
     * Unknown / used / expired → 400 INVALID_LINK, same as accept.
     */
    @Transactional(readOnly = true)
    public InvitePreviewResponse preview(String token) {
        RecruiterInvite invite = inviteRepository.findByTokenHash(SecureTokens.sha256(token))
                .filter(i -> i.isUsable(clock.instant()))
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_LINK));
        String companyName = companyNames.namesByIds(List.of(invite.getCompanyId())).get(invite.getCompanyId());
        String invitedBy = invite.getInvitedBy() == null ? null
                : userRepository.findById(invite.getInvitedBy()).map(User::getEmail).orElse(null);
        return new InvitePreviewResponse(invite.getEmail(), companyName, invitedBy, invite.getExpiresAt());
    }
}
