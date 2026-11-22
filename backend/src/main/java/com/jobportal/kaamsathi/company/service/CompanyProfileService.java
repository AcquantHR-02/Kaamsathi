package com.jobportal.kaamsathi.company.service;

import com.jobportal.kaamsathi.common.exception.ApiException;
import com.jobportal.kaamsathi.common.exception.ErrorCode;
import com.jobportal.kaamsathi.company.dto.PublicCompanyResponse;
import com.jobportal.kaamsathi.company.entity.Company;
import com.jobportal.kaamsathi.company.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Public company page. A SEPARATE service on purpose: it needs LiveJobCounter (= JobService),
 * and JobService needs CompanyService. Putting this in CompanyService would make a bean cycle.
 */
@Service
public class CompanyProfileService {

    private final CompanyRepository companyRepository;
    private final LiveJobCounter liveJobCounter;

    public CompanyProfileService(CompanyRepository companyRepository, LiveJobCounter liveJobCounter) {
        this.companyRepository = companyRepository;
        this.liveJobCounter = liveJobCounter;
    }

    /** VERIFIED company → profile. Unknown / PENDING / REJECTED → the same 404 (don't reveal it exists). */
    @Transactional(readOnly = true)
    public PublicCompanyResponse getPublic(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .filter(Company::isVerified)
                .orElseThrow(() -> new ApiException(ErrorCode.COMPANY_NOT_FOUND));
        return PublicCompanyResponse.from(company, liveJobCounter.countLiveJobs(companyId));
    }
}
