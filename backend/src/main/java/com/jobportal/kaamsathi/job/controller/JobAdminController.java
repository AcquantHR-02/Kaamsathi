package com.jobportal.kaamsathi.job.controller;

import com.jobportal.kaamsathi.common.dto.PageResponse;
import com.jobportal.kaamsathi.job.dto.BlockJobRequest;
import com.jobportal.kaamsathi.job.dto.JobResponse;
import com.jobportal.kaamsathi.job.entity.JobStatus;
import com.jobportal.kaamsathi.job.service.JobModerationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Admin job moderation. Every method is ADMIN only (class-level @PreAuthorize).
 */
@RestController
@RequestMapping("/api/admin/jobs")
@PreAuthorize("hasRole('ADMIN')")
public class JobAdminController {

    private final JobModerationService moderationService;

    public JobAdminController(JobModerationService moderationService) {
        this.moderationService = moderationService;
    }

    /** GET /api/admin/jobs?status=&page=&size= → all jobs (any company), newest first */
    @GetMapping
    public PageResponse<JobResponse> list(@RequestParam(required = false) JobStatus status,
                                          @RequestParam(required = false) Integer page,
                                          @RequestParam(required = false) Integer size) {
        return moderationService.list(status, page, size);
    }

    /** POST /api/admin/jobs/{id}/block {reason} → 200 BLOCKED */
    @PostMapping("/{id}/block")
    public JobResponse block(@PathVariable UUID id, @Valid @RequestBody BlockJobRequest request) {
        return moderationService.block(id, request.reason());
    }

    /** POST /api/admin/jobs/{id}/unblock → 200 CLOSED */
    @PostMapping("/{id}/unblock")
    public JobResponse unblock(@PathVariable UUID id) {
        return moderationService.unblock(id);
    }
}
