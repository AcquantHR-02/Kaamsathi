package com.jobportal.kaamsathi.application.repository;

import com.jobportal.kaamsathi.application.entity.Application;
import com.jobportal.kaamsathi.application.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Only the application module touches the `applications` table.
 */
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    // admin dashboard: applications sent since a moment
    long countByCreatedAtGreaterThanEqual(Instant since);

    // already applied? (fast path; the UNIQUE key is the real guard)
    boolean existsByJobIdAndSeekerId(UUID jobId, UUID seekerId);

    // "my applications", newest first (index seeker_id, created_at)
    Page<Application> findBySeekerIdOrderByCreatedAtDesc(UUID seekerId, Pageable pageable);

    // the seeker's OWN application (someone else's → empty → 404)
    Optional<Application> findByIdAndSeekerId(UUID id, UUID seekerId);

    // applicants of one job, newest first; status null = all statuses (index job_id via UNIQUE (job_id, seeker_id))
    @Query("""
            SELECT a FROM Application a
            WHERE a.jobId = :jobId AND (:status IS NULL OR a.status = :status)
            ORDER BY a.createdAt DESC""")
    Page<Application> findForJob(UUID jobId, ApplicationStatus status, Pageable pageable);

    // an application of MY company (another company's → empty → 404)
    Optional<Application> findByIdAndCompanyId(UUID id, UUID companyId);

    // Same lookups, but LOCK the row (SELECT … FOR UPDATE) until the transaction ends.
    // Used before a status change: recruiter move + seeker withdraw at the same moment → the 2nd waits,
    // then sees the real status (no lost update). "ForUpdate" in the name is only a label for Spring Data.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Application> findForUpdateByIdAndCompanyId(UUID id, UUID companyId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Application> findForUpdateByIdAndSeekerId(UUID id, UUID seekerId);

    /**
     * First open by the company: APPLIED → VIEWED in ONE atomic UPDATE.
     * Returns 1 only for the very first open; 0 if already viewed / moved / withdrawn / not ours.
     * Two recruiters at the same moment → the DB lets only one of them change the row.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Application a
            SET a.status = com.jobportal.kaamsathi.application.entity.ApplicationStatus.VIEWED,
                a.viewedAt = :now, a.updatedAt = :now
            WHERE a.id = :id AND a.companyId = :companyId
              AND a.status = com.jobportal.kaamsathi.application.entity.ApplicationStatus.APPLIED""")
    int markViewed(UUID id, UUID companyId, Instant now);

    // ---- scheduler (Phase 5.3). "Waiting" = APPLIED or VIEWED: the recruiter has not replied yet ----

    // waiting applications sent on/before `cutoff` (index (status, created_at)); a batch per run
    List<Application> findTop500ByStatusInAndCreatedAtLessThanEqual(Collection<ApplicationStatus> statuses,
                                                                    Instant cutoff);

    // same, but only those not reminded yet
    List<Application> findTop500ByStatusInAndCreatedAtLessThanEqualAndReminderSentAtIsNull(
            Collection<ApplicationStatus> statuses, Instant cutoff);

    // waiting applications of one job (job closed / expired)
    List<Application> findByJobIdAndStatusIn(UUID jobId, Collection<ApplicationStatus> statuses);

    // waiting → CLOSED_NO_RESPONSE in ONE atomic UPDATE: 0 = the recruiter / seeker acted meanwhile (keep theirs)
    @Modifying(flushAutomatically = true)
    @Query("""
            UPDATE Application a
            SET a.status = com.jobportal.kaamsathi.application.entity.ApplicationStatus.CLOSED_NO_RESPONSE,
                a.updatedAt = :now
            WHERE a.id = :id
              AND a.status IN (com.jobportal.kaamsathi.application.entity.ApplicationStatus.APPLIED,
                               com.jobportal.kaamsathi.application.entity.ApplicationStatus.VIEWED)""")
    int closeIfWaiting(UUID id, Instant now);

    // day-10 reminder flag, only once and only while still waiting
    @Modifying(flushAutomatically = true)
    @Query("""
            UPDATE Application a SET a.reminderSentAt = :now
            WHERE a.id = :id AND a.reminderSentAt IS NULL
              AND a.status IN (com.jobportal.kaamsathi.application.entity.ApplicationStatus.APPLIED,
                               com.jobportal.kaamsathi.application.entity.ApplicationStatus.VIEWED)""")
    int markReminderSent(UUID id, Instant now);

    /*
     * Employer response score (Phase 5.4), per company, applications sent between :from and :to
     * (from = 90 days ago, to = 4 days ago → too-new applications are not judged yet).
     * Withdrawn ones don't count. "Replied" = first_response_at within 4 days of applying
     * (a move or a reject; opening alone never sets it). Auto-closed ones have no first_response_at → "no reply".
     * CAST: MySQL SUM gives a DECIMAL; SIGNED makes it a plain whole number for Long.
     */
    @Query(nativeQuery = true, value = """
            SELECT a.company_id AS companyId,
                   COUNT(*) AS basis,
                   CAST(SUM(CASE WHEN a.first_response_at IS NOT NULL
                                  AND a.first_response_at <= a.created_at + INTERVAL 4 DAY
                             THEN 1 ELSE 0 END) AS SIGNED) AS replied
            FROM applications a
            WHERE a.created_at >= :from AND a.created_at <= :to
              AND a.status <> 'WITHDRAWN'
            GROUP BY a.company_id""")
    List<CompanyReplyStats> replyStats(Instant from, Instant to);
}
