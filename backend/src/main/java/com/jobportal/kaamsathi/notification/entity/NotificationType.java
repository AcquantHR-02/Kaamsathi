package com.jobportal.kaamsathi.notification.entity;

/**
 * Kind of in-app message. Stored as text (no DB CHECK) so a new kind needs no migration.
 */
public enum NotificationType {
    COMPANY_VERIFIED,
    COMPANY_REJECTED,
    APPLICATION_SUBMITTED,       // to the company: new applicant
    APPLICATION_STATUS_CHANGED,  // to the seeker
    APPLICATION_AUTO_CLOSED,     // to the seeker: 14 days, no reply
    APPLICANTS_WAITING,          // to the company: day-10 reminder
    JOB_EXPIRING,
    JOB_EXPIRED,
    JOB_BLOCKED,
    PAYMENT_APPROVED,
    PAYMENT_REJECTED,
    SUBSCRIPTION_EXPIRING,
    SUBSCRIPTION_EXPIRED
}
