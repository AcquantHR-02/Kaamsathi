package com.jobportal.kaamsathi.payment.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Admin approved a payment → a subscription was created (starts now, or later for an early renewal).
 * One event (not a separate SubscriptionActivated) so the owner gets ONE message with the dates.
 */
public record PaymentApproved(UUID paymentId, UUID companyId, String planName, Instant startsAt, Instant endsAt) {
}
