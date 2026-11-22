package com.jobportal.kaamsathi.job.repository;

import com.jobportal.kaamsathi.job.entity.Job;
import com.jobportal.kaamsathi.job.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * DB access for `jobs` (+ `job_skills`). Only the job module uses this.
 */
public interface JobRepository extends JpaRepository<Job, UUID> {

    // SELECT COUNT(*) FROM jobs WHERE company_id = ?   (free quota: posts used, lifetime — closed jobs count too)
    long countByCompanyId(UUID companyId);

    // admin user detail: jobs this user posted
    long countByCreatedBy(UUID userId);

    // SELECT COUNT(*) FROM jobs WHERE company_id = ? AND status = ? AND expires_at > ?
    // (paid plan: slots in use = LIVE jobs right now; a past-expiry job frees its slot even before the scheduler)
    long countByCompanyIdAndStatusAndExpiresAtAfter(UUID companyId, JobStatus status, Instant now);

    // ---- scheduler (Phase 5.3) ----

    // live jobs whose 60 days are over (index (status, expires_at)); a batch per run
    List<Job> findTop500ByStatusAndExpiresAtLessThanEqual(JobStatus status, Instant now);

    // live jobs ending soon that were not reminded yet
    List<Job> findTop500ByStatusAndExpiresAtBetweenAndExpiryRemindedAtIsNull(JobStatus status, Instant from, Instant to);

    // ACTIVE → EXPIRED in ONE atomic UPDATE: 1 = we expired it; 0 = the company closed it meanwhile
    @Modifying(flushAutomatically = true)
    @Query("""
            UPDATE Job j SET j.status = com.jobportal.kaamsathi.job.entity.JobStatus.EXPIRED, j.updatedAt = :now
            WHERE j.id = :id AND j.status = com.jobportal.kaamsathi.job.entity.JobStatus.ACTIVE
              AND j.expiresAt <= :now""")
    int expireIfDue(@Param("id") UUID id, @Param("now") Instant now);

    // reminder flag, set only once (two scheduler runs at the same moment → only one gets 1)
    @Modifying(flushAutomatically = true)
    @Query("UPDATE Job j SET j.expiryRemindedAt = :now WHERE j.id = :id AND j.expiryRemindedAt IS NULL")
    int markExpiryReminded(@Param("id") UUID id, @Param("now") Instant now);

    // ---- admin (Phase 5.5) ----

    // moderation list, newest first; status null = all
    @Query("SELECT j FROM Job j WHERE (:status IS NULL OR j.status = :status) ORDER BY j.createdAt DESC")
    Page<Job> findForAdmin(@Param("status") JobStatus status, Pageable pageable);

    // dashboard: live jobs right now
    long countByStatusAndExpiresAtAfter(JobStatus status, Instant now);

    // dashboard: live jobs that expire inside a window ("74 expire this week")
    long countByStatusAndExpiresAtBetween(JobStatus status, Instant from, Instant to);

    // ---- employer score copy (Phase 5.4): all jobs neutral, then each scored company's rate ----
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE Job j SET j.employerReplyRate = NULL")
    int resetEmployerReplyRates();

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE Job j SET j.employerReplyRate = :rate WHERE j.companyId = :companyId")
    int setEmployerReplyRate(@Param("companyId") UUID companyId, @Param("rate") Integer rate);

    // SELECT * FROM jobs WHERE id = ? AND company_id = ?   (a job of ANOTHER company is simply "not found")
    Optional<Job> findByIdAndCompanyId(UUID id, UUID companyId);

    // SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC   (company's own list, newest first)
    List<Job> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);

    // public job page: only a live job (ACTIVE and not past expiry)
    Optional<Job> findByIdAndStatusAndExpiresAtAfter(UUID id, JobStatus status, Instant now);

    /*
     * Public search. NATIVE SQL because JPQL has no MATCH ... AGAINST (MySQL FULLTEXT).
     * Every filter has the form "(:x IS NULL OR ...)": a missing filter switches itself off.
     * ids / enums are passed as Strings (columns are CHAR / VARCHAR).
     * q = '' means "no keyword"; otherwise q is already in BOOLEAN MODE syntax (built in JobSearchService).
     * Sort: best keyword match first (× 0.9–1.1 by employer reply rate; new employer = 50% = ×1.0, neutral),
     * then newest DAY; inside the same day a better-replying employer first; then newest.
     * = a GENTLE boost: it never beats a clearly better keyword match or a newer day.
     * Spring adds LIMIT/OFFSET from the Pageable.
     */
    String SEARCH_WHERE = """
            FROM jobs j
            WHERE j.status = 'ACTIVE'
              AND j.expires_at > :now
              AND (:q = '' OR MATCH(j.title, j.description) AGAINST (:q IN BOOLEAN MODE))
              AND (:cityId IS NULL OR j.city_id = :cityId)
              AND (:categoryId IS NULL OR j.category_id = :categoryId)
              AND (:workMode IS NULL OR j.work_mode = :workMode)
              AND (:jobType IS NULL OR j.job_type = :jobType)
              AND (:experience IS NULL OR (j.experience_min <= :experience
                   AND (j.experience_max IS NULL OR j.experience_max >= :experience)))
              AND (:salaryMin IS NULL OR j.salary_max >= :salaryMin
                   OR (j.salary_max IS NULL AND j.salary_min >= :salaryMin))
              AND (:skillId IS NULL OR EXISTS (
                   SELECT 1 FROM job_skills s WHERE s.job_id = j.id AND s.skill_id = :skillId))
            """;

    @Query(nativeQuery = true,
            value = "SELECT j.* " + SEARCH_WHERE + """
                    ORDER BY CASE WHEN :q = '' THEN 0
                                  ELSE MATCH(j.title, j.description) AGAINST (:q IN BOOLEAN MODE)
                                       * (0.9 + 0.2 * COALESCE(j.employer_reply_rate, 50) / 100) END DESC,
                             DATE(j.created_at) DESC,
                             COALESCE(j.employer_reply_rate, 50) DESC,
                             j.created_at DESC
                    """,
            countQuery = "SELECT COUNT(*) " + SEARCH_WHERE)
    Page<Job> search(@Param("q") String q,
                     @Param("cityId") String cityId,
                     @Param("categoryId") String categoryId,
                     @Param("skillId") String skillId,
                     @Param("workMode") String workMode,
                     @Param("jobType") String jobType,
                     @Param("experience") Integer experience,
                     @Param("salaryMin") Integer salaryMin,
                     @Param("now") Instant now,
                     Pageable pageable);
}
