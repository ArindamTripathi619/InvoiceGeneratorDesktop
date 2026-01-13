// Prevents additional console window on Windows in release
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let app_handle = app.handle();
            // Create generated invoices directory
            let app_data_dir = app_handle.path_resolver().app_data_dir().unwrap();
            let generated_dir = app_data_dir.join("generated");
            if !generated_dir.exists() {
                std::fs::create_dir_all(generated_dir).unwrap();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
