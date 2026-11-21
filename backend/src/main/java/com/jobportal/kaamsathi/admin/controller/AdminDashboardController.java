package com.jobportal.kaamsathi.admin.controller;

import com.jobportal.kaamsathi.admin.dto.AuditLogResponse;
import com.jobportal.kaamsathi.admin.dto.DashboardResponse;
import com.jobportal.kaamsathi.admin.service.AuditService;
import com.jobportal.kaamsathi.admin.service.DashboardService;
import com.jobportal.kaamsathi.common.dto.PageResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Admin home: dashboard numbers + audit log. ADMIN only. (Reads only → never written to the audit log.)
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final DashboardService dashboardService;
    private final AuditService auditService;

    public AdminDashboardController(DashboardService dashboardService, AuditService auditService) {
        this.dashboardService = dashboardService;
        this.auditService = auditService;
    }

    /** GET /api/admin/dashboard */
    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return dashboardService.build();
    }

    /** GET /api/admin/audit-log?adminId=&targetId=&page=&size= → newest first */
    @GetMapping("/audit-log")
    public PageResponse<AuditLogResponse> auditLog(@RequestParam(required = false) UUID adminId,
                                                   @RequestParam(required = false) UUID targetId,
                                                   @RequestParam(required = false) Integer page,
                                                   @RequestParam(required = false) Integer size) {
        return auditService.list(adminId, targetId, page, size);
    }
}
