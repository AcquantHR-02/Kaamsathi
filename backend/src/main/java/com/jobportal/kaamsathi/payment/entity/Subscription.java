package com.jobportal.kaamsathi.payment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * One plan period of a company = one row of `subscriptions` (made by V19__create_subscriptions.sql).
 * Created when the admin approves a payment request. Limits are COPIED from the plan (plan edits never change it).
 */
@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(length = 36)
    private UUID id;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "company_id", nullable = false, length = 36)
    private UUID companyId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "plan_id", nullable = false, length = 36)
    private UUID planId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "payment_request_id", nullable = false, length = 36)
    private UUID paymentRequestId;        // the approved payment (UNIQUE: one payment → one subscription)

    @Column(name = "job_slots", nullable = false)
    private int jobSlots;                 // COPY: max ACTIVE jobs at the same time

    @Column(name = "recruiter_seats", nullable = false)
    private int recruiterSeats;           // COPY: max recruiters (active + pending invites)

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionStatus status;

    @Column(name = "expiry_reminded_at")
    private Instant expiryRemindedAt;     // "plan ends soon" sent (scheduler, once)

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Subscription() {
    }

    // starts now → ACTIVE; starts later (early renewal) → PENDING
    public Subscription(UUID id, UUID companyId, UUID planId, UUID paymentRequestId,
                        int jobSlots, int recruiterSeats, Instant startsAt, Instant endsAt, Instant now) {
        this.id = id;
        this.companyId = companyId;
        this.planId = planId;
        this.paymentRequestId = paymentRequestId;
        this.jobSlots = jobSlots;
        this.recruiterSeats = recruiterSeats;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.status = startsAt.isAfter(now) ? SubscriptionStatus.PENDING : SubscriptionStatus.ACTIVE;
        this.createdAt = now;
        this.updatedAt = now;
    }

    // ---- behaviour ----

    // the TRUTH until the Phase 5 scheduler exists: dates decide, status only rules out CANCELLED
    public boolean isActiveAt(Instant at) {
        return status != SubscriptionStatus.CANCELLED
                && !at.isBefore(startsAt)          // startsAt <= at
                && at.isBefore(endsAt);            // at < endsAt
    }

    // status as the DATES say (the stored column is only moved by the Phase 5 scheduler)
    public SubscriptionStatus statusAt(Instant at) {
        if (status == SubscriptionStatus.CANCELLED) return SubscriptionStatus.CANCELLED;
        if (at.isBefore(startsAt)) return SubscriptionStatus.PENDING;
        if (at.isBefore(endsAt)) return SubscriptionStatus.ACTIVE;
        return SubscriptionStatus.EXPIRED;
    }

    public UUID getId() { return id; }
    public UUID getCompanyId() { return companyId; }
    public UUID getPlanId() { return planId; }
    public UUID getPaymentRequestId() { return paymentRequestId; }
    public int getJobSlots() { return jobSlots; }
    public int getRecruiterSeats() { return recruiterSeats; }
    public Instant getStartsAt() { return startsAt; }
    public Instant getEndsAt() { return endsAt; }
    public SubscriptionStatus getStatus() { return status; }
    public Instant getExpiryRemindedAt() { return expiryRemindedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
