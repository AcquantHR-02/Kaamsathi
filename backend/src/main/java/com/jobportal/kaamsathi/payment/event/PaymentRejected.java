package com.jobportal.kaamsathi.payment.event;

import java.util.UUID;

/** Admin rejected a payment (owner may send a new one). */
public record PaymentRejected(UUID paymentId, UUID companyId, String planName, String reason) {
}
