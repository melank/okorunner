mod db;

#[cfg(target_os = "macos")]
mod macos_window;

use tauri::Manager;

#[tauri::command]
fn raise_app_window(app: tauri::AppHandle, label: String) -> Result<(), String> {
    let window = app
        .get_webview_window(&label)
        .ok_or_else(|| format!("window not found: {label}"))?;

    #[cfg(target_os = "macos")]
    macos_window::raise_window(&window).map_err(|error| error.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(db::DATABASE_URL, db::migrations())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![raise_app_window])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            #[cfg(target_os = "macos")]
            for label in ["main", "manage"] {
                if let Some(window) = app.get_webview_window(label) {
                    macos_window::configure_popover_for_active_space(&window)?;
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run Tauri application")
}
