package com.jobportal.kaamsathi.payment.scheduler;

import com.jobportal.kaamsathi.payment.service.SubscriptionLifecycleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Every run: sync plan statuses with the dates (renewal → ACTIVE, ended → EXPIRED), then "ends soon" reminders. */
@Component
public class SubscriptionScheduler {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionScheduler.class);

    private final SubscriptionLifecycleService lifecycle;

    public SubscriptionScheduler(SubscriptionLifecycleService lifecycle) {
        this.lifecycle = lifecycle;
    }

    @Scheduled(cron = "${app.scheduler.cron}")
    public void run() {
        int expired = lifecycle.syncStatuses();
        int reminded = lifecycle.remindExpiring();
        if (expired + reminded > 0) {
            log.info("Subscription scheduler: {} expired, {} expiry reminders", expired, reminded);
        }
    }
}
