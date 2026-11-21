package com.jobportal.kaamsathi.job.event;

import java.time.Instant;
import java.util.UUID;

/** A live job ends in ≤ 3 days (sent once). The company is reminded. */
public record JobExpiring(UUID jobId, UUID companyId, String title, Instant expiresAt) {
}
