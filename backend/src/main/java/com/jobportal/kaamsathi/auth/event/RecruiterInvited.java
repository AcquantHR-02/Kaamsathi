package com.jobportal.kaamsathi.auth.event;

/**
 * Owner invited a recruiter. The invitee has NO account yet → email only (no bell).
 * Carries the accept link (in-process event, never stored or logged elsewhere).
 */
public record RecruiterInvited(String email, String acceptLink) {
}
