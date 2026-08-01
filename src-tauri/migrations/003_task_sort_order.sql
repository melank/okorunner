ALTER TABLE tasks ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE tasks SET sort_order = id;
