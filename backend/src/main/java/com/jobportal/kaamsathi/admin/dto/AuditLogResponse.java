package com.jobportal.kaamsathi.admin.dto;

import com.jobportal.kaamsathi.admin.entity.AuditLogEntry;

import java.time.Instant;
import java.util.UUID;

/** One audit row: WHO (admin id + email), WHAT (action + target type/label; method + path kept), WHEN. */
public record AuditLogResponse(
        UUID id,
        UUID adminId,
        String adminEmail,      // null if that admin was deleted
        String method,
        String path,
        UUID targetId,
        String action,          // e.g. COMPANY_VERIFIED; null on old rows
        String targetType,      // e.g. COMPANY
        String targetLabel,     // name at that time, e.g. "TechNova Labs"
        int status,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLogEntry e, String adminEmail) {
        return new AuditLogResponse(e.getId(), e.getAdminId(), adminEmail, e.getMethod(), e.getPath(),
                e.getTargetId(), e.getAction(), e.getTargetType(), e.getTargetLabel(), e.getStatus(), e.getCreatedAt());
    }
}
