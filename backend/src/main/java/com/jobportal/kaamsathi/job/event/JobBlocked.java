package com.jobportal.kaamsathi.job.event;

import java.util.UUID;

/** Admin blocked a job (moderation). The company team is told why. */
public record JobBlocked(UUID jobId, UUID companyId, String title, String reason) {
}
