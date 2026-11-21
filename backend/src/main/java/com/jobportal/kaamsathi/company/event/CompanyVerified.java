package com.jobportal.kaamsathi.company.event;

import java.util.UUID;

/** Admin verified a company. Published by CompanyService; heard after commit by notification. */
public record CompanyVerified(UUID companyId, String companyName) {
}
