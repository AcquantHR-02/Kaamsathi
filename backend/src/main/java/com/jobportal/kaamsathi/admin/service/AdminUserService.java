package com.jobportal.kaamsathi.admin.service;

import com.jobportal.kaamsathi.admin.dto.AdminUserDetailResponse;
import com.jobportal.kaamsathi.admin.dto.AdminUserDetailResponse.Activity;
import com.jobportal.kaamsathi.application.service.ApplicationService;
import com.jobportal.kaamsathi.auth.dto.UserAccountView;
import com.jobportal.kaamsathi.auth.service.AccountService;
import com.jobportal.kaamsathi.file.entity.FileKind;
import com.jobportal.kaamsathi.file.service.FileService;
import com.jobportal.kaamsathi.job.service.JobService;
import com.jobportal.kaamsathi.job.service.SavedJobService;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Admin user detail page. Lives in the admin module because it needs numbers from many modules
 * (auth, application, job, file, admin). admin → every module; nothing depends on admin → no cycle.
 */
@Service
public class AdminUserService {

    private final AccountService accountService;
    private final ApplicationService applicationService;
    private final SavedJobService savedJobService;
    private final JobService jobService;
    private final FileService fileService;
    private final AuditService auditService;

    public AdminUserService(AccountService accountService, ApplicationService applicationService,
                            SavedJobService savedJobService, JobService jobService, FileService fileService,
                            AuditService auditService) {
        this.accountService = accountService;
        this.applicationService = applicationService;
        this.savedJobService = savedJobService;
        this.jobService = jobService;
        this.fileService = fileService;
        this.auditService = auditService;
    }

    public AdminUserDetailResponse get(UUID userId) {
        UserAccountView account = accountService.getAccount(userId);      // 404 USER_NOT_FOUND
        Activity activity = switch (account.user().role()) {
            case SEEKER -> new Activity(
                    applicationService.countBySeeker(userId),
                    applicationService.countActiveBySeeker(userId),
                    savedJobService.countBySeeker(userId),
                    fileService.countByOwner(userId, FileKind.RESUME),
                    null, null);
            case COMPANY_OWNER, RECRUITER -> new Activity(null, null, null, null, jobService.countPostedBy(userId), null);
            case ADMIN -> new Activity(null, null, null, null, null, auditService.countByAdmin(userId));
        };
        return AdminUserDetailResponse.of(account, activity);
    }
}
