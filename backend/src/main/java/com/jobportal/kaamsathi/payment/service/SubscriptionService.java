package com.jobportal.kaamsathi.payment.service;

import com.jobportal.kaamsathi.auth.service.RecruiterSeatLimit;
import com.jobportal.kaamsathi.auth.service.UserService;
import com.jobportal.kaamsathi.common.exception.ApiException;
import com.jobportal.kaamsathi.common.exception.ErrorCode;
import com.jobportal.kaamsathi.payment.dto.MySubscriptionResponse;
import com.jobportal.kaamsathi.payment.dto.PlanLimits;
import com.jobportal.kaamsathi.payment.dto.SubscriptionResponse;
import com.jobportal.kaamsathi.payment.entity.Subscription;
import com.jobportal.kaamsathi.payment.entity.SubscriptionStatus;
import com.jobportal.kaamsathi.payment.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * "What may this company do right now?" — the ONE place that knows plans, dates and grace days.
 * Other modules ask here (job: slots; auth: seats via RecruiterSeatLimit) instead of reading our tables.
 */
@Service
public class SubscriptionService implements RecruiterSeatLimit {

    static final Duration GRACE = Duration.ofDays(3);   // plan ended < 3 days ago → still counts
    static final int FREE_RECRUITER_SEATS = 1;

    private final SubscriptionRepository subscriptionRepository;
    private final PlanService planService;
    private final UserService userService;
    private final Clock clock;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, PlanService planService,
                               UserService userService, Clock clock) {
        this.subscriptionRepository = subscriptionRepository;
        this.planService = planService;
        this.userService = userService;
        this.clock = clock;
    }

    /**
     * The company's paid limits now (grace days included). Empty = no plan → free rules.
     * Until the Phase 5 scheduler exists, DATES decide (status is only used to skip CANCELLED).
     */
    @Transactional(readOnly = true)
    public Optional<PlanLimits> currentLimits(UUID companyId) {
        return findCurrentWithGrace(companyId, clock.instant())
                .map(s -> new PlanLimits(s.getJobSlots(), s.getRecruiterSeats(), s.getEndsAt()));
    }

    @Override
    @Transactional(readOnly = true)
    public int seatLimit(UUID companyId) {
        return currentLimits(companyId)
                .map(PlanLimits::recruiterSeats)
                .orElse(FREE_RECRUITER_SEATS);
    }

    // owner's "my plan" box: current period (grace too) + an approved renewal waiting to start
    @Transactional(readOnly = true)
    public MySubscriptionResponse getMine(UUID ownerId) {
        UUID companyId = userService.getCompanyId(ownerId);
        if (companyId == null) {
            throw new ApiException(ErrorCode.COMPANY_REQUIRED);
        }
        Instant now = clock.instant();
        Subscription current = findCurrentWithGrace(companyId, now).orElse(null);
        Subscription next = subscriptionRepository
                .findFirstByCompanyIdAndStatusNotAndStartsAtAfterOrderByStartsAtAsc(
                        companyId, SubscriptionStatus.CANCELLED, now)
                .orElse(null);

        Map<UUID, String> planNames = planService.namesByIds(
                Stream.of(current, next).filter(s -> s != null).map(Subscription::getPlanId).toList());
        return new MySubscriptionResponse(
                current == null,
                current == null ? null : SubscriptionResponse.from(current, planNames.get(current.getPlanId()), now),
                next == null ? null : SubscriptionResponse.from(next, planNames.get(next.getPlanId()), now));
    }

    // started already AND (still running OR ended less than GRACE ago)
    private Optional<Subscription> findCurrentWithGrace(UUID companyId, Instant now) {
        return subscriptionRepository
                .findFirstByCompanyIdAndStatusNotAndStartsAtLessThanEqualAndEndsAtAfterOrderByEndsAtDesc(
                        companyId, SubscriptionStatus.CANCELLED, now, now.minus(GRACE));
    }
}
