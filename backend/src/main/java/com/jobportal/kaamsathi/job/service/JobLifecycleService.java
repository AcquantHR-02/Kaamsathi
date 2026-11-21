package com.jobportal.kaamsathi.job.service;

import com.jobportal.kaamsathi.company.dto.ResponseScore;
import com.jobportal.kaamsathi.company.event.ResponseScoresUpdated;
import com.jobportal.kaamsathi.job.entity.Job;
import com.jobportal.kaamsathi.job.entity.JobStatus;
import com.jobportal.kaamsathi.job.event.JobExpired;
import com.jobportal.kaamsathi.job.event.JobExpiring;
import com.jobportal.kaamsathi.job.repository.JobRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

/**
 * Time-based job rules, run by JobScheduler: expire after 60 days, remind 3 days before.
 * Each change is an atomic UPDATE, so a company closing the job at the same moment is never overwritten.
 */
@Service
public class JobLifecycleService {

    static final Duration REMIND_BEFORE = Duration.ofDays(3);

    private final JobRepository jobRepository;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public JobLifecycleService(JobRepository jobRepository, ApplicationEventPublisher events, Clock clock) {
        this.jobRepository = jobRepository;
        this.events = events;
        this.clock = clock;
    }

    /** ACTIVE jobs past expires_at → EXPIRED (frees the plan slot). Returns how many. */
    @Transactional
    public int expireDueJobs() {
        Instant now = clock.instant();
        int count = 0;
        for (Job job : jobRepository.findTop500ByStatusAndExpiresAtLessThanEqual(JobStatus.ACTIVE, now)) {
            if (jobRepository.expireIfDue(job.getId(), now) == 1) {
                // application module closes waiting applications in THIS transaction; notification after commit
                events.publishEvent(new JobExpired(job.getId(), job.getCompanyId(), job.getTitle()));
                count++;
            }
        }
        return count;
    }

    /**
     * Company scores were recomputed → copy each rate onto that company's jobs (search boost).
     * @EventListener = same transaction as the save: scores and job copies change together.
     */
    @EventListener
    public void on(ResponseScoresUpdated e) {
        jobRepository.resetEmployerReplyRates();
        for (ResponseScore s : e.scores()) {
            if (s.ratePercent() != null) {
                jobRepository.setEmployerReplyRate(s.companyId(), s.ratePercent());
            }
        }
    }

    /** Live jobs ending within 3 days, not reminded yet → one reminder each. Returns how many. */
    @Transactional
    public int remindExpiringJobs() {
        Instant now = clock.instant();
        int count = 0;
        for (Job job : jobRepository.findTop500ByStatusAndExpiresAtBetweenAndExpiryRemindedAtIsNull(
                JobStatus.ACTIVE, now, now.plus(REMIND_BEFORE))) {
            if (jobRepository.markExpiryReminded(job.getId(), now) == 1) {
                events.publishEvent(new JobExpiring(job.getId(), job.getCompanyId(), job.getTitle(), job.getExpiresAt()));
                count++;
            }
        }
        return count;
    }
}
