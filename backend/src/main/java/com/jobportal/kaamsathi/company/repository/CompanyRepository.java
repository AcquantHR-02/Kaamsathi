package com.jobportal.kaamsathi.company.repository;

import com.jobportal.kaamsathi.company.entity.Company;
import com.jobportal.kaamsathi.company.entity.CompanyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * DB access for the `companies` table. Only the company module uses this;
 * other modules go through company's service/ layer.
 */
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    // SELECT * FROM companies WHERE owner_id = ?   ("my company"; also: does this owner already have one?)
    Optional<Company> findByOwnerId(UUID ownerId);

    // SELECT 1 FROM companies WHERE gstin = ? LIMIT 1   (register: is this GSTIN already used?)
    boolean existsByGstin(String gstin);

    // SELECT 1 ... WHERE gstin = ? AND id <> ?   (update: GSTIN used by ANOTHER company?)
    boolean existsByGstinAndIdNot(String gstin, UUID id);

    // SELECT * FROM companies WHERE status = ? ORDER BY created_at   (admin review queue: oldest first)
    List<Company> findByStatusOrderByCreatedAtAsc(CompanyStatus status);

    // admin dashboard
    long countByStatus(CompanyStatus status);

    // ---- employer response score (daily job, Phase 5.4) ----

    // step 1: everyone back to "New employer"
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE Company c SET c.responseRate = NULL, c.responseBasis = 0, c.responseScoreAt = :now")
    int resetResponseScores(@Param("now") Instant now);

    // step 2: one company that had applications in the window
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            UPDATE Company c SET c.responseRate = :rate, c.responseBasis = :basis, c.responseScoreAt = :now
            WHERE c.id = :id""")
    int setResponseScore(@Param("id") UUID id, @Param("rate") Integer rate, @Param("basis") int basis,
                         @Param("now") Instant now);
}
