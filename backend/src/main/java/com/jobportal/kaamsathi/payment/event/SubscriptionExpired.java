package com.jobportal.kaamsathi.payment.event;

import java.time.Instant;
import java.util.UUID;

/** A plan period ended and no renewal took over. Grace days still allow posting; then free rules. */
public record SubscriptionExpired(UUID companyId, String planName, Instant endedAt) {
}
