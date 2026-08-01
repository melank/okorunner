use tauri_plugin_sql::{Migration, MigrationKind};

pub const DATABASE_URL: &str = "sqlite:okorunner.db";

pub fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_tasks_and_suggestions",
            sql: include_str!("../migrations/001_schema.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "seed_initial_tasks",
            sql: include_str!("../migrations/002_seed_tasks.sql"),
            kind: MigrationKind::Up,
        },
    ]
}
