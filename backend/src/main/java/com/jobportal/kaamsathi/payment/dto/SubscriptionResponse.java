package com.jobportal.kaamsathi.payment.dto;

import com.jobportal.kaamsathi.common.dto.NamedRef;
import com.jobportal.kaamsathi.payment.entity.Subscription;
import com.jobportal.kaamsathi.payment.entity.SubscriptionStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * One plan period as the owner sees it. status comes from the DATES (statusAt).
 * inGracePeriod = the period is over but the 3 grace days still allow posting.
 */
public record SubscriptionResponse(
        UUID id,
        NamedRef plan,
        int jobSlots,
        int recruiterSeats,
        Instant startsAt,
        Instant endsAt,
        SubscriptionStatus status,
        boolean inGracePeriod
) {
    public static SubscriptionResponse from(Subscription s, String planName, Instant now) {
        SubscriptionStatus status = s.statusAt(now);
        return new SubscriptionResponse(s.getId(), new NamedRef(s.getPlanId(), planName),
                s.getJobSlots(), s.getRecruiterSeats(), s.getStartsAt(), s.getEndsAt(),
                status, status == SubscriptionStatus.EXPIRED);
    }
}
