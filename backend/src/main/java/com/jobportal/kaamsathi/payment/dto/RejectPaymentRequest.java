package com.jobportal.kaamsathi.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Admin rejects a payment: {"reason": "Transaction ID not found in our bank statement"}.
 * The owner sees the reason and may send a new request.
 */
public record RejectPaymentRequest(

        @NotBlank(message = "reason is required")
        @Size(max = 500, message = "reason must be at most 500 characters")
        String reason
) {
}
