-- Employer response score (Phase 5.4): "Replies to X% of applicants within 4 days" (last 90 days).
-- Computed daily by the application module, saved on the company (company module owns it).
ALTER TABLE companies
    ADD COLUMN response_rate     TINYINT     NULL,                 -- 0–100; NULL = "New employer" (< 10 applications)
    ADD COLUMN response_basis    INT         NOT NULL DEFAULT 0,   -- applications counted ("based on N applications")
    ADD COLUMN response_score_at DATETIME(6) NULL,                 -- last computed
    ADD CONSTRAINT ck_companies_response_rate CHECK (response_rate IS NULL OR response_rate BETWEEN 0 AND 100);

-- Copy of the rate on each job, owned by the job module (search sorts with it without reading `companies`).
-- Updated by an event whenever the scores are recomputed. NULL = neutral.
ALTER TABLE jobs ADD COLUMN employer_reply_rate TINYINT NULL;
