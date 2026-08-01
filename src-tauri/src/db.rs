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
        Migration {
            version: 3,
            description: "add_task_sort_order",
            sql: include_str!("../migrations/003_task_sort_order.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_settings",
            sql: include_str!("../migrations/004_settings.sql"),
            kind: MigrationKind::Up,
        },
    ]
}
