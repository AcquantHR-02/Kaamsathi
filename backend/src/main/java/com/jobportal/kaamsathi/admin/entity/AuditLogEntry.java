package com.jobportal.kaamsathi.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * One admin write = one row of `admin_audit_log` (V23). Immutable: no setters, no behaviour.
 */
@Entity
@Table(name = "admin_audit_log")
public class AuditLogEntry {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(length = 36)
    private UUID id;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "admin_id", length = 36)
    private UUID adminId;

    @Column(nullable = false, length = 10)
    private String method;

    @Column(nullable = false, length = 255)
    private String path;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "target_id", length = 36)
    private UUID targetId;

    @Column(nullable = false)
    private short status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AuditLogEntry() {
    }

    public AuditLogEntry(UUID id, UUID adminId, String method, String path, UUID targetId, int status, Instant now) {
        this.id = id;
        this.adminId = adminId;
        this.method = method;
        this.path = path;
        this.targetId = targetId;
        this.status = (short) status;
        this.createdAt = now;
    }

    public UUID getId() { return id; }
    public UUID getAdminId() { return adminId; }
    public String getMethod() { return method; }
    public String getPath() { return path; }
    public UUID getTargetId() { return targetId; }
    public int getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
