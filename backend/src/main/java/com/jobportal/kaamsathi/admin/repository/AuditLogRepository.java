package com.jobportal.kaamsathi.admin.repository;

import com.jobportal.kaamsathi.admin.entity.AuditLogEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

/** DB access for `admin_audit_log` (admin module only). */
public interface AuditLogRepository extends JpaRepository<AuditLogEntry, UUID> {

    // newest first; adminId / targetId null = no filter
    @Query("""
            SELECT a FROM AuditLogEntry a
            WHERE (:adminId IS NULL OR a.adminId = :adminId)
              AND (:targetId IS NULL OR a.targetId = :targetId)
            ORDER BY a.createdAt DESC""")
    Page<AuditLogEntry> search(@Param("adminId") UUID adminId, @Param("targetId") UUID targetId, Pageable pageable);
}
