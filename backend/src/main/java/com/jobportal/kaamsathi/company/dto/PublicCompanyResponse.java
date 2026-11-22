package com.jobportal.kaamsathi.company.dto;

import com.jobportal.kaamsathi.company.entity.Company;

import java.time.Instant;
import java.util.UUID;

/**
 * Public company page (anyone, no login). Only VERIFIED companies.
 * No owner id, GSTIN, status or rejection reason — those are private.
 */
public record PublicCompanyResponse(
        UUID id,
        String name,
        String industry,
        String size,
        String location,
        String website,
        UUID logoFileId,              // null = no logo; image at GET /api/companies/{id}/logo
        EmployerScore responseScore,
        long liveJobs,                // ACTIVE, not expired
        Instant memberSince           // registered on Kaamsathi
) {

    public static PublicCompanyResponse from(Company c, long liveJobs) {
        return new PublicCompanyResponse(c.getId(), c.getName(), c.getIndustry(), c.getSize(), c.getLocation(),
                c.getWebsite(), c.getLogoFileId(), EmployerScore.of(c.getResponseRate(), c.getResponseBasis()),
                liveJobs, c.getCreatedAt());
    }
}
