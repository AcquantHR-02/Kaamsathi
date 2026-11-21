package com.jobportal.kaamsathi.company.dto;

import java.util.UUID;

/**
 * One company's computed score, sent by the application module's daily job to CompanyService.
 * ratePercent null = "New employer" (fewer than 10 applications counted).
 */
public record ResponseScore(UUID companyId, Integer ratePercent, int basis) {
}
