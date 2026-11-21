package com.jobportal.kaamsathi.job.event;

import java.util.UUID;

/** The scheduler expired a job (60 days over). Waiting applications close; the company is told. */
public record JobExpired(UUID jobId, UUID companyId, String title) {
}
