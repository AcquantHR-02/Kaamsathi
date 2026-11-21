package com.jobportal.kaamsathi.auth.repository;

import com.jobportal.kaamsathi.auth.entity.InviteStatus;
import com.jobportal.kaamsathi.auth.entity.RecruiterInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * DB access for the `recruiter_invites` table (auth module only).
 */
public interface RecruiterInviteRepository extends JpaRepository<RecruiterInvite, UUID> {

    // SELECT * FROM recruiter_invites WHERE token_hash = ?   (UNIQUE index → fast)
    Optional<RecruiterInvite> findByTokenHash(String tokenHash);

    // seats held by open invites: SELECT COUNT(*) ... WHERE company_id = ? AND status = ? AND expires_at > ?
    // (an expired invite gives its seat back)
    long countByCompanyIdAndStatusAndExpiresAtAfter(UUID companyId, InviteStatus status, Instant now);
}
