package com.jobportal.kaamsathi.application.event;

import java.util.UUID;

/** Day-10 reminder: `count` applicants of this job got no reply yet (ONE message per job, not per applicant). */
public record ApplicantsWaiting(UUID jobId, UUID companyId, String jobTitle, int count) {
}
