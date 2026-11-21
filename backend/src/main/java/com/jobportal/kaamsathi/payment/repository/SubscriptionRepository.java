package com.jobportal.kaamsathi.payment.repository;

import com.jobportal.kaamsathi.payment.entity.Subscription;
import com.jobportal.kaamsathi.payment.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * DB access for the `subscriptions` table. Only the payment module uses this.
 */
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    // the period that covers a moment (not CANCELLED, startsAt <= startedBy, endsAt > endsAfter), latest end first
    // SELECT * FROM subscriptions WHERE company_id = ? AND status <> ? AND starts_at <= ? AND ends_at > ?
    //   ORDER BY ends_at DESC LIMIT 1
    Optional<Subscription> findFirstByCompanyIdAndStatusNotAndStartsAtLessThanEqualAndEndsAtAfterOrderByEndsAtDesc(
            UUID companyId, SubscriptionStatus notStatus, Instant startedBy, Instant endsAfter);

    // approve / renewal: the company's LAST period (also a future PENDING one) → a new one starts when it ends
    Optional<Subscription> findFirstByCompanyIdAndStatusNotOrderByEndsAtDesc(UUID companyId, SubscriptionStatus notStatus);

    // "my subscription" page: the next period that starts later (early renewal), soonest first
    Optional<Subscription> findFirstByCompanyIdAndStatusNotAndStartsAtAfterOrderByStartsAtAsc(
            UUID companyId, SubscriptionStatus notStatus, Instant now);

    // ---- scheduler (Phase 5.3): keep the stored status in line with the dates ----

    // PENDING renewals whose start date came → ACTIVE (one UPDATE for all)
    @Modifying(flushAutomatically = true)
    @Query("""
            UPDATE Subscription s SET s.status = com.jobportal.kaamsathi.payment.entity.SubscriptionStatus.ACTIVE,
                s.updatedAt = :now
            WHERE s.status = com.jobportal.kaamsathi.payment.entity.SubscriptionStatus.PENDING AND s.startsAt <= :now""")
    int activateStarted(@Param("now") Instant now);

    // ACTIVE periods whose end date passed (index (status, ends_at))
    List<Subscription> findTop500ByStatusAndEndsAtLessThanEqual(SubscriptionStatus status, Instant now);

    @Modifying(flushAutomatically = true)
    @Query("""
            UPDATE Subscription s SET s.status = com.jobportal.kaamsathi.payment.entity.SubscriptionStatus.EXPIRED,
                s.updatedAt = :now
            WHERE s.id = :id AND s.status = com.jobportal.kaamsathi.payment.entity.SubscriptionStatus.ACTIVE
              AND s.endsAt <= :now""")
    int expireIfEnded(@Param("id") UUID id, @Param("now") Instant now);

    // ACTIVE periods ending soon, not reminded yet
    List<Subscription> findTop500ByStatusAndEndsAtBetweenAndExpiryRemindedAtIsNull(
            SubscriptionStatus status, Instant from, Instant to);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE Subscription s SET s.expiryRemindedAt = :now WHERE s.id = :id AND s.expiryRemindedAt IS NULL")
    int markExpiryReminded(@Param("id") UUID id, @Param("now") Instant now);

    // ---- short names for the service (default methods = plain Java on top of the generated queries) ----

    // what the company has right now (exact dates, no grace)
    default Optional<Subscription> findCurrent(UUID companyId, Instant now) {
        return findFirstByCompanyIdAndStatusNotAndStartsAtLessThanEqualAndEndsAtAfterOrderByEndsAtDesc(
                companyId, SubscriptionStatus.CANCELLED, now, now);
    }

    // the latest period (current or future), to know where a renewal must start
    default Optional<Subscription> findLatest(UUID companyId) {
        return findFirstByCompanyIdAndStatusNotOrderByEndsAtDesc(companyId, SubscriptionStatus.CANCELLED);
    }
}
