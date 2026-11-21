package com.jobportal.kaamsathi.payment.dto;

/**
 * Owner's "Billing / my plan" box.
 * free = true → no plan now (free rules: 5 job posts lifetime, 1 recruiter); current is then null.
 * next = an already approved renewal that starts when current ends (or null).
 */
public record MySubscriptionResponse(
        boolean free,
        SubscriptionResponse current,
        SubscriptionResponse next
) {
}
