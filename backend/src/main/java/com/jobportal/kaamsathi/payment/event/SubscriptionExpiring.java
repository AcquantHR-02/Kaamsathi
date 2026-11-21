package com.jobportal.kaamsathi.payment.event;

import java.time.Instant;
import java.util.UUID;

/** The company's LAST plan period ends in ≤ 3 days (no renewal bought). Owner reminded once. */
public record SubscriptionExpiring(UUID companyId, String planName, Instant endsAt) {
}
