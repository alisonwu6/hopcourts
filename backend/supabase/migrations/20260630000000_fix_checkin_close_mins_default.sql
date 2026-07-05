-- Align checkin_close_mins_after default with product rule: check-in closes when the game ends.
ALTER TABLE sessions ALTER COLUMN checkin_close_mins_after SET DEFAULT 0;

-- Backfill existing rows that used the old defaults (5 or 10) so they reflect the new policy.
UPDATE sessions SET checkin_close_mins_after = 0 WHERE checkin_close_mins_after IN (5, 10);
