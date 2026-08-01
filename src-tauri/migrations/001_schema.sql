CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks (id),
  suggested_at TEXT NOT NULL,
  done_at TEXT,
  motivated INTEGER CHECK (motivated IS NULL OR motivated IN (0, 1))
);

CREATE INDEX idx_suggestions_task_id ON suggestions (task_id);
CREATE INDEX idx_suggestions_suggested_at ON suggestions (suggested_at);
