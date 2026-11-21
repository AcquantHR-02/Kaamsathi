package com.jobportal.kaamsathi.payment.repository;

import com.jobportal.kaamsathi.payment.entity.PaymentRequest;
import com.jobportal.kaamsathi.payment.entity.PaymentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * DB access for the `payment_requests` table. Only the payment module uses this.
 */
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, UUID> {

    // send: friendly check "already one pending?" (the DB UNIQUE rule is the real guard)
    boolean existsByCompanyIdAndStatus(UUID companyId, PaymentStatus status);

    // owner's billing history, newest first, one page at a time
    // SELECT * FROM payment_requests WHERE company_id = ? ORDER BY created_at DESC LIMIT ?, ?
    Page<PaymentRequest> findByCompanyIdOrderByCreatedAtDesc(UUID companyId, Pageable pageable);

    // admin dashboard
    long countByStatus(PaymentStatus status);

    // total of APPROVED payments (fake money, but the admin wants the number); no rows → 0
    @Query("""
            SELECT COALESCE(SUM(p.amountRupees), 0) FROM PaymentRequest p
            WHERE p.status = com.jobportal.kaamsathi.payment.entity.PaymentStatus.APPROVED""")
    long sumApprovedRupees();

    // admin approval queue: oldest waiting first (fair: first come, first served)
    List<PaymentRequest> findByStatusOrderByCreatedAtAsc(PaymentStatus status);

    // approve / reject: SELECT ... FOR UPDATE → a 2nd admin click waits, then sees APPROVED (no double approve).
    // "ForUpdate" in the name is only a label for Spring Data.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PaymentRequest> findForUpdateById(UUID id);
}
