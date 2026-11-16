-- Campus Maintenance Requests: one table of maintenance records.
-- The CHECK rules repeat the API validation so bad data cannot be stored
-- even if a request skips the route checks.

CREATE TABLE IF NOT EXISTS records (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 80),
  category    TEXT NOT NULL CHECK (length(category) BETWEEN 2 AND 40),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 5 AND 300),
  status      TEXT NOT NULL DEFAULT 'Pending'
              CHECK (status IN ('Pending', 'In progress', 'Completed')),
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Keep updated_at current whenever a record changes.
CREATE TRIGGER IF NOT EXISTS records_set_updated_at
AFTER UPDATE ON records
FOR EACH ROW
BEGIN
  UPDATE records SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
