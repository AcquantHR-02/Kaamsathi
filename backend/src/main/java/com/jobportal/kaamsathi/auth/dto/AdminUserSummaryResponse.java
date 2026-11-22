package com.jobportal.kaamsathi.auth.dto;

import com.jobportal.kaamsathi.auth.entity.User;
import com.jobportal.kaamsathi.auth.entity.UserStatus;
import com.jobportal.kaamsathi.common.dto.NamedRef;
import com.jobportal.kaamsathi.common.security.Role;

import java.time.Instant;
import java.util.UUID;

/**
 * One row of the admin users table / admins list.
 * Same first fields as UserResponse, plus what the admin screen needs:
 * company (owners / recruiters), ownsCompany (Delete would be 409), mainAdmin (row can't be changed).
 */
public record AdminUserSummaryResponse(
        UUID id,
        String email,
        Role role,
        UserStatus status,
        UUID photoFileId,
        Instant createdAt,
        NamedRef company,           // null for seekers / admins / owners without a company
        boolean ownsCompany,        // COMPANY_OWNER with a company → can't be deleted
        boolean mainAdmin           // the ADMIN_EMAIL account
) {

    public static AdminUserSummaryResponse from(User user, String companyName, boolean mainAdmin) {
        UUID companyId = user.getCompanyId();
        return new AdminUserSummaryResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getPhotoFileId(),
                user.getCreatedAt(),
                companyId == null ? null : new NamedRef(companyId, companyName),
                user.getRole() == Role.COMPANY_OWNER && companyId != null,
                mainAdmin);
    }
}
