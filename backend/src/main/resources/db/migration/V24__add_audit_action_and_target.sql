-- V24: audit log says WHAT was acted on, in words (frontend asked; Reference: "who, what, when").
--   action       e.g. COMPANY_VERIFIED, SKILL_CREATED (from a fixed list of admin endpoints)
--   target_type  e.g. COMPANY, USER, JOB, PAYMENT, PLAN, SKILL, CITY, INDUSTRY, JOB_CATEGORY
--   target_label snapshot of the name AT THAT TIME ("TechNova Labs") → still readable after a rename / delete
-- Old rows keep NULLs (frontend falls back to method + path).
-- NEVER edit this file after it has run. Add V25__... for changes.

ALTER TABLE admin_audit_log
    ADD COLUMN action       VARCHAR(40)  NULL AFTER status,
    ADD COLUMN target_type  VARCHAR(20)  NULL AFTER action,
    ADD COLUMN target_label VARCHAR(255) NULL AFTER target_type;
