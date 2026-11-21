package com.jobportal.kaamsathi.application.scheduler;

import com.jobportal.kaamsathi.application.service.ApplicationLifecycleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Every run: close silent applications (14 days) FIRST, then send day-10 reminders for the rest. */
@Component
public class ApplicationScheduler {

    private static final Logger log = LoggerFactory.getLogger(ApplicationScheduler.class);

    private final ApplicationLifecycleService lifecycle;

    public ApplicationScheduler(ApplicationLifecycleService lifecycle) {
        this.lifecycle = lifecycle;
    }

    @Scheduled(cron = "${app.scheduler.cron}")
    public void run() {
        int closed = lifecycle.closeSilentApplications();
        int jobsReminded = lifecycle.remindWaitingApplicants();
        if (closed + jobsReminded > 0) {
            log.info("Application scheduler: {} auto-closed, {} jobs reminded", closed, jobsReminded);
        }
    }
}
