package com.jobportal.kaamsathi.company.controller;

import com.jobportal.kaamsathi.company.dto.PublicCompanyResponse;
import com.jobportal.kaamsathi.company.service.CompanyProfileService;
import com.jobportal.kaamsathi.company.service.CompanyService;
import com.jobportal.kaamsathi.file.dto.FileContent;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;

/**
 * Public company endpoints (no login; SecurityConfig permits GET /api/companies/* and /api/companies/*\/logo).
 * "/me" and "/pending" are literal paths in other controllers and win over "{id}".
 */
@RestController
@RequestMapping("/api/companies")
public class CompanyPublicController {

    private final CompanyProfileService companyProfileService;
    private final CompanyService companyService;

    public CompanyPublicController(CompanyProfileService companyProfileService, CompanyService companyService) {
        this.companyProfileService = companyProfileService;
        this.companyService = companyService;
    }

    /** GET /api/companies/{id} → public profile of a VERIFIED company, else 404. */
    @GetMapping("/{id}")
    public PublicCompanyResponse get(@PathVariable UUID id) {
        return companyProfileService.getPublic(id);
    }

    /** GET /api/companies/{id}/logo → the image bytes (for an <img>). */
    @GetMapping("/{id}/logo")
    public ResponseEntity<Resource> logo(@PathVariable UUID id) {
        FileContent logo = companyService.openLogo(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(logo.contentType()))
                .contentLength(logo.sizeBytes())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(logo.originalName(), StandardCharsets.UTF_8).build().toString())
                // public data → shared caches may keep it 5 min
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
                .body(logo.resource());
    }
}
