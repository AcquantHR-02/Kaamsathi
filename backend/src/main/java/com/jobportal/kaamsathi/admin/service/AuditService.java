package com.jobportal.kaamsathi.admin.service;

import com.jobportal.kaamsathi.admin.dto.AuditLogResponse;
import com.jobportal.kaamsathi.admin.entity.AuditLogEntry;
import com.jobportal.kaamsathi.admin.repository.AuditLogRepository;
import com.jobportal.kaamsathi.auth.service.UserService;
import com.jobportal.kaamsathi.common.dto.PageResponse;
import com.jobportal.kaamsathi.common.util.Paging;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Admin audit log: write one row per successful admin action (called by AdminAuditInterceptor), read the list.
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserService userService;
    private final Clock clock;

    public AuditService(AuditLogRepository auditLogRepository, UserService userService, Clock clock) {
        this.auditLogRepository = auditLogRepository;
        this.userService = userService;
        this.clock = clock;
    }

    // runs after the action's own transaction finished → its own small transaction
    @Transactional
    public void record(UUID adminId, String method, String path, UUID targetId, int status,
                       String action, String targetType, String targetLabel) {
        String label = targetLabel == null || targetLabel.length() <= 255 ? targetLabel : targetLabel.substring(0, 255);
        auditLogRepository.save(new AuditLogEntry(UUID.randomUUID(), adminId, method, path, targetId, status,
                action, targetType, label, clock.instant()));
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> list(UUID adminId, UUID targetId, Integer page, Integer size) {
        Page<AuditLogEntry> rows = auditLogRepository.search(adminId, targetId, Paging.of(page, size));
        Map<UUID, String> emails = userService.emailsByIds(
                rows.getContent().stream().map(AuditLogEntry::getAdminId).filter(Objects::nonNull).distinct().toList());
        return PageResponse.from(rows, e -> AuditLogResponse.from(e,
                e.getAdminId() == null ? null : emails.get(e.getAdminId())));
    }

    // admin user detail
    @Transactional(readOnly = true)
    public long countByAdmin(UUID adminId) {
        return auditLogRepository.countByAdminId(adminId);
    }
}
