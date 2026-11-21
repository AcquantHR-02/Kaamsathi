package com.jobportal.kaamsathi.payment.entity;

/**
 * Status of a subscription. Saved as text (same values as the CHECK in V19).
 * PENDING (renewal waiting for its start date) → ACTIVE → EXPIRED; CANCELLED by admin (later).
 * Until the Phase 5 scheduler moves these, "active now" is decided from the DATES (see Subscription.isActiveAt).
 */
public enum SubscriptionStatus {
    PENDING,
    ACTIVE,
    EXPIRED,
    CANCELLED
}
