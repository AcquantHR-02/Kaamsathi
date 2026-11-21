package com.jobportal.kaamsathi.payment.dto;

import java.time.Instant;

/**
 * What a company's paid plan allows right now (given to other modules, e.g. job).
 * No plan → no PlanLimits at all (Optional.empty) → the free rules apply.
 */
public record PlanLimits(int jobSlots, int recruiterSeats, Instant endsAt) {
}
