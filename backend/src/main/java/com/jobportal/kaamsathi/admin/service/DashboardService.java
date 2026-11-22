package com.jobportal.kaamsathi.admin.service;

import com.jobportal.kaamsathi.admin.dto.DashboardResponse;
import com.jobportal.kaamsathi.application.service.ApplicationService;
import com.jobportal.kaamsathi.auth.service.UserService;
import com.jobportal.kaamsathi.common.security.Role;
import com.jobportal.kaamsathi.company.entity.CompanyStatus;
import com.jobportal.kaamsathi.company.service.CompanyService;
import com.jobportal.kaamsathi.job.service.JobModerationService;
import com.jobportal.kaamsathi.payment.entity.PaymentStatus;
import com.jobportal.kaamsathi.payment.service.PaymentService;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

/**
 * Admin dashboard: asks each module's SERVICE for its counts (never their tables).
 * admin → every module; no module depends on admin → no cycle.
 * Simple COUNT queries, run on demand (cache later if it ever gets slow).
 */
@Service
public class DashboardService {

    private static final Duration WEEK = Duration.ofDays(7);

    private final UserService userService;
    private final CompanyService companyService;
    private final JobModerationService jobModerationService;
    private final ApplicationService applicationService;
    private final PaymentService paymentService;
    private final Clock clock;

    public DashboardService(UserService userService, CompanyService companyService,
                            JobModerationService jobModerationService, ApplicationService applicationService,
                            PaymentService paymentService, Clock clock) {
        this.userService = userService;
        this.companyService = companyService;
        this.jobModerationService = jobModerationService;
        this.applicationService = applicationService;
        this.paymentService = paymentService;
        this.clock = clock;
    }

    public DashboardResponse build() {
        Instant now = clock.instant();
        return new DashboardResponse(
                new DashboardResponse.Users(
                        userService.countByRole(Role.SEEKER),
                        userService.countByRole(Role.COMPANY_OWNER),
                        userService.countByRole(Role.RECRUITER),
                        userService.countByRole(Role.ADMIN),
                        userService.countSuspended(),
                        userService.countCreatedSince(now.minus(WEEK))),
                new DashboardResponse.Companies(
                        companyService.countByStatus(CompanyStatus.PENDING),
                        companyService.countByStatus(CompanyStatus.VERIFIED),
                        companyService.countByStatus(CompanyStatus.REJECTED)),
                new DashboardResponse.Jobs(jobModerationService.countLive(),
                        jobModerationService.countExpiringWithin(WEEK)),
                new DashboardResponse.Applications(
                        applicationService.countAll(),
                        applicationService.countSince(now.minus(Duration.ofDays(30)))),
                new DashboardResponse.Payments(
                        paymentService.countByStatus(PaymentStatus.PENDING_APPROVAL),
                        paymentService.countByStatus(PaymentStatus.APPROVED),
                        paymentService.approvedRevenueRupees()),
                now);
    }
}
