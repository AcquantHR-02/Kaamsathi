package com.jobportal.kaamsathi.application.service;

import com.jobportal.kaamsathi.application.entity.Application;
import com.jobportal.kaamsathi.application.entity.ApplicationStatus;
import com.jobportal.kaamsathi.application.entity.ApplicationStatusHistory;
import com.jobportal.kaamsathi.application.event.ApplicantsWaiting;
import com.jobportal.kaamsathi.application.event.ApplicationAutoClosed;
import com.jobportal.kaamsathi.application.repository.ApplicationRepository;
import com.jobportal.kaamsathi.application.repository.ApplicationStatusHistoryRepository;
import com.jobportal.kaamsathi.job.dto.JobSummaryResponse;
import com.jobportal.kaamsathi.job.event.JobClosed;
import com.jobportal.kaamsathi.job.event.JobExpired;
import com.jobportal.kaamsathi.job.service.JobSearchService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * "No ghosting" rules (Reference §2):
 * - day 10 without a reply → ONE reminder per job to the company,
 * - day 14 without a reply → CLOSED_NO_RESPONSE + polite message to the seeker,
 * - job closed / expired → its waiting applications close the same way.
 * "Waiting" = APPLIED or VIEWED (opening is not a reply). Changes are atomic UPDATEs: if the recruiter
 * moves the application at the same moment, the recruiter wins and we skip it.
 */
@Service
public class ApplicationLifecycleService {

    static final Duration REMIND_AFTER = Duration.ofDays(10);
    static final Duration CLOSE_AFTER = Duration.ofDays(14);
    static final Set<ApplicationStatus> WAITING = Set.of(ApplicationStatus.APPLIED, ApplicationStatus.VIEWED);

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final JobSearchService jobSearchService;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public ApplicationLifecycleService(ApplicationRepository applicationRepository,
                                       ApplicationStatusHistoryRepository historyRepository,
                                       JobSearchService jobSearchService, ApplicationEventPublisher events,
                                       Clock clock) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.jobSearchService = jobSearchService;
        this.events = events;
        this.clock = clock;
    }

    /** Scheduler: waiting ≥ 14 days → CLOSED_NO_RESPONSE. Returns how many. */
    @Transactional
    public int closeSilentApplications() {
        Instant now = clock.instant();
        List<Application> due = applicationRepository.findTop500ByStatusInAndCreatedAtLessThanEqual(
                WAITING, now.minus(CLOSE_AFTER));
        Map<UUID, String> titles = titlesOf(due);
        int count = 0;
        for (Application a : due) {
            if (close(a, now, titles.get(a.getJobId()), false)) {
                count++;
            }
        }
        return count;
    }

    /** Scheduler: waiting ≥ 10 days and not reminded → one ApplicantsWaiting per job. Returns jobs reminded. */
    @Transactional
    public int remindWaitingApplicants() {
        Instant now = clock.instant();
        List<Application> due = applicationRepository.findTop500ByStatusInAndCreatedAtLessThanEqualAndReminderSentAtIsNull(
                WAITING, now.minus(REMIND_AFTER));
        // keep only the ones WE flagged (atomic), then group per job
        Map<UUID, List<Application>> perJob = due.stream()
                .filter(a -> applicationRepository.markReminderSent(a.getId(), now) == 1)
                .collect(Collectors.groupingBy(Application::getJobId));
        Map<UUID, String> titles = titlesOf(due);
        perJob.forEach((jobId, apps) -> events.publishEvent(new ApplicantsWaiting(
                jobId, apps.get(0).getCompanyId(), titles.get(jobId), apps.size())));
        return perJob.size();
    }

    // Job module events: same transaction as the close / expire (@EventListener, not after commit),
    // so "job closed" and "its waiting applications closed" happen together or not at all.
    @EventListener
    public void on(JobClosed e) {
        closeWaitingOfJob(e.jobId(), e.title());
    }

    @EventListener
    public void on(JobExpired e) {
        closeWaitingOfJob(e.jobId(), e.title());
    }

    private void closeWaitingOfJob(UUID jobId, String title) {
        Instant now = clock.instant();
        for (Application a : applicationRepository.findByJobIdAndStatusIn(jobId, WAITING)) {
            close(a, now, title, true);
        }
    }

    // atomic close + timeline row (changedBy null = system) + event for the polite message
    private boolean close(Application a, Instant now, String jobTitle, boolean jobEnded) {
        if (applicationRepository.closeIfWaiting(a.getId(), now) != 1) {
            return false;                                   // recruiter / seeker acted meanwhile
        }
        historyRepository.save(new ApplicationStatusHistory(UUID.randomUUID(), a.getId(), a.getStatus(),
                ApplicationStatus.CLOSED_NO_RESPONSE, null, now));
        events.publishEvent(new ApplicationAutoClosed(a.getId(), a.getSeekerId(), jobTitle, jobEnded));
        return true;
    }

    // job titles for a batch, few queries (closed / expired jobs included)
    private Map<UUID, String> titlesOf(List<Application> apps) {
        List<UUID> jobIds = apps.stream().map(Application::getJobId).distinct().toList();
        return jobSearchService.cardsByIds(jobIds).values().stream()
                .collect(Collectors.toMap(JobSummaryResponse::id, JobSummaryResponse::title));
    }
}
