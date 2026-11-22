-- V25: company logo (Reference: "Company registration: name, logo, GSTIN, ...").
-- Points to files (kind LOGO, image ≤ 2 MB). File deleted → logo just disappears (SET NULL).
-- NEVER edit this file after it has run. Add V26__... for changes.

ALTER TABLE companies
    ADD COLUMN logo_file_id CHAR(36) NULL AFTER location,
    ADD CONSTRAINT fk_companies_logo FOREIGN KEY (logo_file_id) REFERENCES files (id) ON DELETE SET NULL;
