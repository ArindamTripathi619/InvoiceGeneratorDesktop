// Prevents additional console window on Windows in release
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Create app data directory if it doesn't exist
            let app_dir = app.path_resolver().app_data_dir().unwrap();
            if !app_dir.exists() {
                std::fs::create_dir_all(&app_dir)?;
            }
            
            // Create generated invoices directory
            let invoices_dir = app_dir.join("generated");
            if !invoices_dir.exists() {
                std::fs::create_dir_all(&invoices_dir)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
