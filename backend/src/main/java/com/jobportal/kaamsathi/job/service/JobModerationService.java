package com.jobportal.kaamsathi.job.service;

import com.jobportal.kaamsathi.common.dto.PageResponse;
import com.jobportal.kaamsathi.common.exception.ApiException;
import com.jobportal.kaamsathi.common.exception.ErrorCode;
import com.jobportal.kaamsathi.common.util.Paging;
import com.jobportal.kaamsathi.job.dto.JobResponse;
import com.jobportal.kaamsathi.job.entity.Job;
import com.jobportal.kaamsathi.job.entity.JobStatus;
import com.jobportal.kaamsathi.job.event.JobBlocked;
import com.jobportal.kaamsathi.job.event.JobClosed;
import com.jobportal.kaamsathi.job.repository.JobRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Admin moderation of jobs (admin actions live in the module that owns the data).
 * BLOCKED job: gone from search + job page (they show only ACTIVE), company can't edit / reopen.
 */
@Service
public class JobModerationService {

    private final JobRepository jobRepository;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public JobModerationService(JobRepository jobRepository, ApplicationEventPublisher events, Clock clock) {
        this.jobRepository = jobRepository;
        this.events = events;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public PageResponse<JobResponse> list(JobStatus status, Integer page, Integer size) {
        return PageResponse.from(jobRepository.findForAdmin(status, Paging.of(page, size)), JobResponse::from);
    }

    /** Any status except BLOCKED → BLOCKED. A live job's waiting applicants are closed politely (JobClosed). */
    @Transactional
    public JobResponse block(UUID jobId, String reason) {
        Job job = find(jobId);
        if (job.isBlocked()) {
            throw new ApiException(ErrorCode.JOB_INVALID_STATE, "This job is already blocked");
        }
        boolean wasActive = job.isActive();
        Instant now = clock.instant();
        job.block(reason.trim(), now);
        if (wasActive) {
            events.publishEvent(new JobClosed(job.getId(), job.getCompanyId(), job.getTitle()));
        }
        events.publishEvent(new JobBlocked(job.getId(), job.getCompanyId(), job.getTitle(), job.getBlockedReason()));
        return JobResponse.from(job);
    }

    /** BLOCKED → CLOSED (the company may reopen it, if its 60 days are not over). */
    @Transactional
    public JobResponse unblock(UUID jobId) {
        Job job = find(jobId);
        if (!job.isBlocked()) {
            throw new ApiException(ErrorCode.JOB_INVALID_STATE, "Only a blocked job can be unblocked");
        }
        job.unblock(clock.instant());
        return JobResponse.from(job);
    }

    // for the admin dashboard
    @Transactional(readOnly = true)
    public long countLive() {
        return jobRepository.countByStatusAndExpiresAtAfter(JobStatus.ACTIVE, clock.instant());
    }

    // dashboard: ACTIVE jobs whose 60 days end in the next 7 days
    @Transactional(readOnly = true)
    public long countExpiringWithin(Duration window) {
        Instant now = clock.instant();
        return jobRepository.countByStatusAndExpiresAtBetween(JobStatus.ACTIVE, now, now.plus(window));
    }

    private Job find(UUID jobId) {
        return jobRepository.findById(jobId).orElseThrow(() -> new ApiException(ErrorCode.JOB_NOT_FOUND));
    }
}
