package com.jobportal.kaamsathi.job.event;

import java.util.UUID;

/**
 * A job stopped taking applicants: closed by the company (expired = JobExpired).
 * The application module closes its waiting applications (same transaction, @EventListener).
 */
public record JobClosed(UUID jobId, UUID companyId, String title) {
}
