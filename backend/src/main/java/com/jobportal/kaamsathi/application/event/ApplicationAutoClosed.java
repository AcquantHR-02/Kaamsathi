package com.jobportal.kaamsathi.application.event;

import java.util.UUID;

/**
 * The SYSTEM closed an application with CLOSED_NO_RESPONSE. The seeker gets a polite message.
 * jobEnded = true → the job was closed / expired; false → 14 days without a recruiter reply.
 */
public record ApplicationAutoClosed(UUID applicationId, UUID seekerId, String jobTitle, boolean jobEnded) {
}
