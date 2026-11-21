-- In-app notifications (the bell icon). One row = one message for one user.
-- Written by the notification module when it hears an event (company verified, application moved, ...).
CREATE TABLE notifications (
    id          CHAR(36)     NOT NULL,
    user_id     CHAR(36)     NOT NULL,
    type        VARCHAR(40)  NOT NULL,              -- e.g. COMPANY_VERIFIED, APPLICATION_STATUS_CHANGED
    title       VARCHAR(150) NOT NULL,
    body        VARCHAR(500) NOT NULL,
    link        VARCHAR(255) NULL,                  -- frontend path to open, e.g. /seeker/applications/<id>
    read_at     DATETIME(6)  NULL,                  -- NULL = unread
    created_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_notifications_user_created (user_id, created_at),   -- "my notifications", newest first
    INDEX idx_notifications_user_read (user_id, read_at)          -- unread count
);
