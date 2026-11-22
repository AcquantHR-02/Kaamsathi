package com.jobportal.kaamsathi.auth.dto;

import java.time.Instant;

/**
 * Auth's part of the admin user detail page: the account row + its security state.
 * The admin module adds activity numbers from other modules on top.
 */
public record UserAccountView(
        AdminUserSummaryResponse user,
        boolean emailVerified,          // false only while UNVERIFIED (OTP not typed yet)
        Instant consentGivenAt,         // null for the seeded / created admins
        int failedLogins,               // wrong passwords in a row
        int maxFailedLogins,            // lock after this many
        Instant lockedUntil,            // null = not locked now
        long activeSessions             // refresh tokens still valid = devices logged in
) {
}
