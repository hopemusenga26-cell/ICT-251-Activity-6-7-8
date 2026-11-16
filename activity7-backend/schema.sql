-- Campus Maintenance Requests: one table of fault reports sent to the help desk.
-- The CHECK rules repeat the API validation so bad data cannot be stored
-- even if a request skips the route checks.
-- reporter_name, student_number and location are optional extra fields:
-- the website always fills them, but an API client may leave them out.

CREATE TABLE IF NOT EXISTS records (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 80),
  category       TEXT NOT NULL CHECK (length(category) BETWEEN 2 AND 40),
  description    TEXT NOT NULL CHECK (length(description) BETWEEN 5 AND 300),
  status         TEXT NOT NULL DEFAULT 'Pending'
                 CHECK (status IN ('Pending', 'In progress', 'Completed')),
  reporter_name  TEXT CHECK (reporter_name IS NULL OR length(reporter_name) BETWEEN 2 AND 80),
  student_number TEXT CHECK (student_number IS NULL OR length(student_number) BETWEEN 6 AND 12),
  location       TEXT CHECK (location IS NULL OR length(location) BETWEEN 3 AND 100),
  created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Keep updated_at current whenever a record changes.
CREATE TRIGGER IF NOT EXISTS records_set_updated_at
AFTER UPDATE ON records
FOR EACH ROW
BEGIN
  UPDATE records SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
