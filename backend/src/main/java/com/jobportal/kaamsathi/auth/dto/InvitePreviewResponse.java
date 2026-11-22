package com.jobportal.kaamsathi.auth.dto;

import java.time.Instant;

/**
 * Accept-invite page, BEFORE the recruiter types a password: "owner@x.com invited you to TechNova Labs".
 * invitedBy is the inviter's EMAIL (owners have no name in our data).
 */
public record InvitePreviewResponse(
        String email,           // the invited email (the account that will be created)
        String companyName,
        String invitedBy,       // inviter's email; null if that account was deleted
        Instant expiresAt
) {
}
