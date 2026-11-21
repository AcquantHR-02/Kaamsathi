package com.jobportal.kaamsathi.application.event;

import java.util.UUID;

/** A seeker applied. The company team gets "new applicant". */
public record ApplicationSubmitted(UUID applicationId, UUID jobId, UUID companyId, String jobTitle) {
}
