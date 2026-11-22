package com.jobportal.kaamsathi.admin.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jobportal.kaamsathi.auth.dto.UserAccountView;
import com.jobportal.kaamsathi.auth.entity.UserStatus;
import com.jobportal.kaamsathi.common.dto.NamedRef;
import com.jobportal.kaamsathi.common.security.Role;

import java.time.Instant;
import java.util.UUID;

/**
 * Admin → Users → one user. Account fields (same as the list row) + security + role-based activity.
 */
public record AdminUserDetailResponse(
        UUID id,
        String email,
        Role role,
        UserStatus status,
        UUID photoFileId,
        Instant createdAt,
        NamedRef company,
        boolean ownsCompany,
        boolean mainAdmin,
        boolean emailVerified,
        Instant consentGivenAt,
        Security security,
        Activity activity
) {

    public record Security(int failedLogins, int maxFailedLogins, Instant lockedUntil, long activeSessions) {
    }

    /**
     * Numbers that fit the role; the others are left out of the JSON (null):
     * SEEKER → applications, activeApplications, savedJobs, resumes · COMPANY_OWNER / RECRUITER → jobsPosted ·
     * ADMIN → adminActions.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Activity(Long applications, Long activeApplications, Long savedJobs, Long resumes,
                           Long jobsPosted, Long adminActions) {
    }

    public static AdminUserDetailResponse of(UserAccountView v, Activity activity) {
        var u = v.user();
        return new AdminUserDetailResponse(u.id(), u.email(), u.role(), u.status(), u.photoFileId(), u.createdAt(),
                u.company(), u.ownsCompany(), u.mainAdmin(), v.emailVerified(), v.consentGivenAt(),
                new Security(v.failedLogins(), v.maxFailedLogins(), v.lockedUntil(), v.activeSessions()),
                activity);
    }
}
