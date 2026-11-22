package com.jobportal.kaamsathi.company.service;

import java.util.UUID;

/**
 * "How many live jobs does this company have?" for the public company page.
 * Company OWNS this interface; the job module IMPLEMENTS it (JobService).
 * The job module already depends on company, so company can't call job directly (cycle) → dependency inversion.
 */
public interface LiveJobCounter {

    /** ACTIVE jobs that are not past their 60 days */
    long countLiveJobs(UUID companyId);
}
