// Prevents additional console window on Windows in release
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use std::fs;

#[tauri::command]
fn export_database(app_handle: tauri::AppHandle, target_path: String) -> Result<(), String> {
    let config_dir = app_handle.path_resolver().app_config_dir().ok_or("Failed to resolve app config dir")?;
    let data_dir = app_handle.path_resolver().app_data_dir().ok_or("Failed to resolve app data dir")?;
    
    let db_path_config = config_dir.join("invoices.db");
    let db_path_data = data_dir.join("invoices.db");

    let db_path = if db_path_config.exists() {
        db_path_config
    } else if db_path_data.exists() {
        db_path_data
    } else {
        return Err("Database file not found".to_string());
    };

    fs::copy(&db_path, &target_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn import_database(app_handle: tauri::AppHandle, source_path: String) -> Result<(), String> {
    let config_dir = app_handle.path_resolver().app_config_dir().ok_or("Failed to resolve app config dir")?;
    let db_path = config_dir.join("invoices.db");
    
    if !std::path::Path::new(&source_path).exists() {
        return Err("Source file not found".to_string());
    }

    fs::copy(&source_path, &db_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_file_content(path: String, content: Vec<u8>) -> Result<(), String> {
    use std::io::Write;
    let mut file = fs::File::create(path).map_err(|e| e.to_string())?;
    file.write_all(&content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn download_gdrive_file(url: String, output_path: String) -> Result<(), String> {
    let client = reqwest::blocking::Client::builder()
        .cookie_store(true)
        .user_agent("Mozilla/5.0")
        .build()
        .map_err(|e| e.to_string())?;

    let extract_id = |s: &str| -> Option<String> {
        if let Some(caps) = regex::Regex::new(r"/folders/([a-zA-Z0-9_-]+)").unwrap().captures(s) {
            return Some(caps.get(1).unwrap().as_str().to_string());
        }
        if let Some(caps) = regex::Regex::new(r"/d/([a-zA-Z0-9_-]+)").unwrap().captures(s) {
            return Some(caps.get(1).unwrap().as_str().to_string());
        }
        if let Some(caps) = regex::Regex::new(r"id=([a-zA-Z0-9_-]+)").unwrap().captures(s) {
            return Some(caps.get(1).unwrap().as_str().to_string());
        }
        Some(s.to_string())
    };

    let initial_id = extract_id(&url).ok_or("Invalid URL")?;
    let is_folder = url.contains("/folders/");

    let mut final_file_id = None;

    if is_folder {
        let folder_url = format!("https://drive.google.com/embeddedfolderview?id={}#list", initial_id);
        if let Ok(resp) = client.get(&folder_url).send() {
             if let Ok(text) = resp.text() {
                 // Try JSON pattern first
                 let re_json = regex::Regex::new(r#"\["([a-zA-Z0-9_-]+)","invoices\.db""#).unwrap();
                 if let Some(caps) = re_json.captures(&text) {
                     final_file_id = Some(caps.get(1).unwrap().as_str().to_string());
                 } else {
                     // Try HTML pattern (Robust)
                      let re_html = regex::Regex::new(r#"(?s)/d/([a-zA-Z0-9_-]+)/view[^>]*>.*?invoices\.db"#).unwrap();
                     if let Some(caps) = re_html.captures(&text) {
                         final_file_id = Some(caps.get(1).unwrap().as_str().to_string());
                     }
                 }
             }
        }
    } else {
        final_file_id = Some(initial_id.clone());
    }

    let file_id_to_try = if let Some(fid) = final_file_id.clone() { fid } else { initial_id.clone() };
    let try_direct_file = !is_folder || final_file_id.is_some();

    if try_direct_file {
        let download_url = format!("https://drive.google.com/uc?id={}&export=download", file_id_to_try);
        if let Ok(mut response) = client.get(&download_url).send() {
             let is_html = response.headers().get("content-type").map(|v| v.to_str().unwrap_or("")).unwrap_or("").contains("text/html");
             if is_html {
                 let text = response.text().unwrap_or_default();
                 if text.contains("confirm=") {
                     let re = regex::Regex::new(r"confirm=([a-zA-Z0-9_-]+)").unwrap();
                     if let Some(caps) = re.captures(&text) {
                         let code = caps.get(1).unwrap().as_str();
                         let confirm_url = format!("{}&confirm={}", download_url, code);
                         if let Ok(mut resp2) = client.get(&confirm_url).send() {
                             let mut file = std::fs::File::create(&output_path).map_err(|e| e.to_string())?;
                             if std::io::copy(&mut resp2, &mut file).is_ok() {
                                 return Ok(());
                             }
                         }
                     }
                 }
             } else {
                 let mut file = std::fs::File::create(&output_path).map_err(|e| e.to_string())?;
                 if std::io::copy(&mut response, &mut file).is_ok() {
                     return Ok(());
                 }
             }
        }
    }

    // Fallback: Zip Download
    if is_folder {
        let download_url = format!("https://drive.google.com/uc?id={}&export=download", initial_id);
        if let Ok(mut response) = client.get(&download_url).send() {
             let is_html = response.headers().get("content-type").map(|v| v.to_str().unwrap_or("")).unwrap_or("").contains("text/html");
             if is_html {
                 let text = response.text().unwrap_or_default();
                 if text.contains("confirm=") {
                     let re = regex::Regex::new(r"confirm=([a-zA-Z0-9_-]+)").unwrap();
                     if let Some(caps) = re.captures(&text) {
                         let code = caps.get(1).unwrap().as_str();
                         let confirm_url = format!("{}&confirm={}", download_url, code);
                         if let Ok(resp2) = client.get(&confirm_url).send() {
                             response = resp2;
                         } else {
                             return Err("Zip Confirm Request failed".to_string());
                         }
                     } else {
                        return Err("Folder Zip failed: Virus scan warning found but no confirm code.".to_string());
                     }
                 } else {
                      return Err("Folder Zip failed: Link returned HTML (Likely Access Denied or Empty Folder).".to_string());
                 }
             }
             
             let zip_path = format!("{}.zip", output_path);
             {
                 let mut file = std::fs::File::create(&zip_path).map_err(|e| e.to_string())?;
                 if let Err(e) = std::io::copy(&mut response, &mut file) {
                      return Err(format!("Failed to save zip: {}", e));
                 }
             }

             let file = std::fs::File::open(&zip_path).map_err(|e| e.to_string())?;
             let mut archive = zip::ZipArchive::new(file).map_err(|e| format!("Invalid Zip: {}", e))?;
             
             let mut found = false;
             for i in 0..archive.len() {
                 let mut file = archive.by_index(i).unwrap();
                 if file.name().ends_with("invoices.db") {
                     let mut outfile = std::fs::File::create(&output_path).map_err(|e| e.to_string())?;
                     std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
                     found = true;
                     break;
                 }
             }
             let _ = std::fs::remove_file(zip_path); 
             
             if found {
                 return Ok(());
             }
             return Err("Fallback: Zip downloaded but 'invoices.db' not found.".to_string());
        }
    }

    Err("Download failed. (Check link permissions and 'invoices.db' existence)".to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![export_database, import_database, save_file_content, download_gdrive_file])
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
