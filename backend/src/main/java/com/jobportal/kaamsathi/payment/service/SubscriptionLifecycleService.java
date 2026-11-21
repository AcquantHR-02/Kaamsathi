package com.jobportal.kaamsathi.payment.service;

import com.jobportal.kaamsathi.payment.entity.Subscription;
import com.jobportal.kaamsathi.payment.entity.SubscriptionStatus;
import com.jobportal.kaamsathi.payment.event.SubscriptionExpired;
import com.jobportal.kaamsathi.payment.event.SubscriptionExpiring;
import com.jobportal.kaamsathi.payment.repository.SubscriptionRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Time-based plan rules, run by SubscriptionScheduler.
 * Limits already follow the DATES (SubscriptionService); this keeps the stored status tidy and sends messages.
 */
@Service
public class SubscriptionLifecycleService {

    static final Duration REMIND_BEFORE = Duration.ofDays(3);

    private final SubscriptionRepository subscriptionRepository;
    private final PlanService planService;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public SubscriptionLifecycleService(SubscriptionRepository subscriptionRepository, PlanService planService,
                                        ApplicationEventPublisher events, Clock clock) {
        this.subscriptionRepository = subscriptionRepository;
        this.planService = planService;
        this.events = events;
        this.clock = clock;
    }

    /**
     * 1. PENDING renewals that started → ACTIVE.  2. ACTIVE periods that ended → EXPIRED; the owner is told
     * ONLY if no renewal took over (else they'd get "expired" while still on a plan).
     */
    @Transactional
    public int syncStatuses() {
        Instant now = clock.instant();
        subscriptionRepository.activateStarted(now);                     // first, so a renewal counts as "current"

        List<Subscription> ended = subscriptionRepository.findTop500ByStatusAndEndsAtLessThanEqual(
                SubscriptionStatus.ACTIVE, now);
        Map<UUID, String> names = planService.namesByIds(
                ended.stream().map(Subscription::getPlanId).toList());
        int count = 0;
        for (Subscription s : ended) {
            if (subscriptionRepository.expireIfEnded(s.getId(), now) == 1) {
                count++;
                if (subscriptionRepository.findCurrent(s.getCompanyId(), now).isEmpty()) {
                    events.publishEvent(new SubscriptionExpired(s.getCompanyId(), names.get(s.getPlanId()), s.getEndsAt()));
                }
            }
        }
        return count;
    }

    /** ACTIVE period ending in ≤ 3 days, and it is the company's LAST one (no renewal bought) → remind once. */
    @Transactional
    public int remindExpiring() {
        Instant now = clock.instant();
        List<Subscription> soon = subscriptionRepository.findTop500ByStatusAndEndsAtBetweenAndExpiryRemindedAtIsNull(
                SubscriptionStatus.ACTIVE, now, now.plus(REMIND_BEFORE));
        Map<UUID, String> names = planService.namesByIds(
                soon.stream().map(Subscription::getPlanId).toList());
        int count = 0;
        for (Subscription s : soon) {
            boolean isLast = subscriptionRepository.findLatest(s.getCompanyId())
                    .map(latest -> latest.getId().equals(s.getId()))
                    .orElse(true);
            if (isLast && subscriptionRepository.markExpiryReminded(s.getId(), now) == 1) {
                events.publishEvent(new SubscriptionExpiring(s.getCompanyId(), names.get(s.getPlanId()), s.getEndsAt()));
                count++;
            }
        }
        return count;
    }
}
