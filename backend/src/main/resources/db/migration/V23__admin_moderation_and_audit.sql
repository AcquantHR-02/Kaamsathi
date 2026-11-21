-- Phase 5.5: job moderation + admin audit log.

-- Why the admin blocked a job (shown to the company). NULL unless BLOCKED.
ALTER TABLE jobs ADD COLUMN blocked_reason VARCHAR(500) NULL;

-- Every successful admin write (who, what, when). Owned by the admin module. Rows are never changed.
CREATE TABLE admin_audit_log (
    id          CHAR(36)     NOT NULL,
    admin_id    CHAR(36)     NULL,               -- NULL if that admin account was deleted later
    method      VARCHAR(10)  NOT NULL,           -- POST / PUT / DELETE
    path        VARCHAR(255) NOT NULL,           -- e.g. /api/companies/<id>/verify
    target_id   CHAR(36)     NULL,               -- first id in the path (company, user, job, ...)
    status      SMALLINT     NOT NULL,           -- HTTP status of the reply (2xx only are stored)
    created_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_audit_created (created_at),
    INDEX idx_audit_admin_created (admin_id, created_at)
);
