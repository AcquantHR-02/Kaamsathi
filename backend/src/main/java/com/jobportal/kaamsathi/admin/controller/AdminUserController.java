package com.jobportal.kaamsathi.admin.controller;

import com.jobportal.kaamsathi.admin.dto.AdminUserDetailResponse;
import com.jobportal.kaamsathi.admin.service.AdminUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Admin → Users → one user. (List / suspend / delete stay in auth's UserAdminController, same base path.)
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    /** GET /api/admin/users/{id} → 200 detail, 404 USER_NOT_FOUND, 400 bad UUID. */
    @GetMapping("/{id}")
    public AdminUserDetailResponse get(@PathVariable UUID id) {
        return adminUserService.get(id);
    }
}
