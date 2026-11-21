package com.jobportal.kaamsathi.job.scheduler;

import com.jobportal.kaamsathi.job.service.JobLifecycleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Every run: expire jobs past 60 days, then remind jobs ending within 3 days. Logic lives in the service. */
@Component
public class JobScheduler {

    private static final Logger log = LoggerFactory.getLogger(JobScheduler.class);

    private final JobLifecycleService lifecycle;

    public JobScheduler(JobLifecycleService lifecycle) {
        this.lifecycle = lifecycle;
    }

    @Scheduled(cron = "${app.scheduler.cron}")
    public void run() {
        int expired = lifecycle.expireDueJobs();
        int reminded = lifecycle.remindExpiringJobs();
        if (expired + reminded > 0) {
            log.info("Job scheduler: {} expired, {} expiry reminders", expired, reminded);
        }
    }
}
