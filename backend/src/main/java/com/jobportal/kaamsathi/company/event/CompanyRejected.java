package com.jobportal.kaamsathi.company.event;

import java.util.UUID;

/** Admin rejected a company (owner can fix and resubmit). */
public record CompanyRejected(UUID companyId, String companyName, String reason) {
}
