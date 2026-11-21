package com.jobportal.kaamsathi.admin.dto;

import com.jobportal.kaamsathi.admin.entity.AuditLogEntry;

import java.time.Instant;
import java.util.UUID;

/** One audit row: WHO (admin id + email), WHAT (method + path + target), WHEN. */
public record AuditLogResponse(
        UUID id,
        UUID adminId,
        String adminEmail,      // null if that admin was deleted
        String method,
        String path,
        UUID targetId,
        int status,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLogEntry e, String adminEmail) {
        return new AuditLogResponse(e.getId(), e.getAdminId(), adminEmail, e.getMethod(), e.getPath(),
                e.getTargetId(), e.getStatus(), e.getCreatedAt());
    }
}
