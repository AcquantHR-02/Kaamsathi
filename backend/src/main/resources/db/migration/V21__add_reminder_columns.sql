-- Schedulers (Phase 5.3): remember that a reminder was already sent, so it is sent only ONCE.
ALTER TABLE jobs          ADD COLUMN expiry_reminded_at DATETIME(6) NULL;   -- "your job expires in 3 days"
ALTER TABLE applications  ADD COLUMN reminder_sent_at   DATETIME(6) NULL;   -- day-10 "applicants are waiting"
ALTER TABLE subscriptions ADD COLUMN expiry_reminded_at DATETIME(6) NULL;   -- "your plan ends in 3 days"
