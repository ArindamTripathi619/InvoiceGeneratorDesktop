// Prevents additional console window on Windows in release
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;
use std::path::{Path, PathBuf};

/// Validates that a path is within the allowed AppData scope to prevent path traversal.
fn ensure_path_in_scope(app_handle: &tauri::AppHandle, path: &str) -> Result<PathBuf, String> {
    let app_data_dir = app_handle.path_resolver().app_data_dir()
        .ok_or_else(|| "Failed to resolve app data dir".to_string())?;
    
    let target_path = Path::new(path);
    
    // If it's an absolute path, it must start with app_data_dir
    if target_path.is_absolute() {
        if target_path.starts_with(&app_data_dir) {
            return Ok(target_path.to_path_buf());
        }
        return Err("Access denied: Path is outside of allowed scope".to_string());
    }
    
    // If it's relative, join it with app_data_dir and canonicalize to check for .. escapes
    let joined_path = app_data_dir.join(target_path);
    // Note: Simple check for ".." to prevent traversal in relative paths
    if path.contains("..") {
        return Err("Access denied: Path contains invalid characters".to_string());
    }
    
    Ok(joined_path)
}

#[tauri::command]
async fn export_database(app_handle: tauri::AppHandle, target_path: String) -> Result<(), String> {
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

    // Note: We don't use ensure_path_in_scope here because target_path comes from a system dialog (Safe)
    fs::copy(&db_path, &target_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn import_database(app_handle: tauri::AppHandle, source_path: String) -> Result<(), String> {
    let config_dir = app_handle.path_resolver().app_config_dir().ok_or("Failed to resolve app config dir")?;
    let db_path = config_dir.join("invoices.db");
    
    if !std::path::Path::new(&source_path).exists() {
        return Err("Source file not found".to_string());
    }

    fs::copy(&source_path, &db_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn save_file_content(app_handle: tauri::AppHandle, path: String, content: Vec<u8>) -> Result<(), String> {
    let safe_path = ensure_path_in_scope(&app_handle, &path)?;
    
    // Ensure parent directory exists
    if let Some(parent) = safe_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    use std::io::Write;
    let mut file = fs::File::create(safe_path).map_err(|e| e.to_string())?;
    file.write_all(&content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn download_gdrive_file(app_handle: tauri::AppHandle, url: String, output_path: String) -> Result<(), String> {
    let safe_output_path = ensure_path_in_scope(&app_handle, &output_path)?;
    
    let client = reqwest::Client::builder()
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
        // Direct ID validation
        if regex::Regex::new(r"^[a-zA-Z0-9_-]{10,50}$").unwrap().is_match(s) {
            return Some(s.to_string());
        }
        None
    };

    let initial_id = extract_id(&url).ok_or("Invalid Google Drive URL or ID")?;
    let is_folder = url.contains("/folders/");

    let mut final_file_id = None;

    if is_folder {
        let folder_url = format!("https://drive.google.com/embeddedfolderview?id={}#list", initial_id);
        if let Ok(resp) = client.get(&folder_url).send().await {
             if let Ok(text) = resp.text().await {
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
        if let Ok(response) = client.get(&download_url).send().await {
             let headers = response.headers().clone();
             let is_html = headers.get("content-type").map(|v| v.to_str().unwrap_or("")).unwrap_or("").contains("text/html");
             if is_html {
                 let text = response.text().await.unwrap_or_default();
                 if text.contains("confirm=") {
                     let re = regex::Regex::new(r"confirm=([a-zA-Z0-9_-]+)").unwrap();
                     if let Some(caps) = re.captures(&text) {
                         let code = caps.get(1).unwrap().as_str();
                         let confirm_url = format!("{}&confirm={}", download_url, code);
                         if let Ok(resp2) = client.get(&confirm_url).send().await {
                              let bytes = resp2.bytes().await.map_err(|e| e.to_string())?;
                              fs::write(&safe_output_path, bytes).map_err(|e| e.to_string())?;
                              return Ok(());
                         }
                     }
                 }
             } else {
                  let bytes = response.bytes().await.map_err(|e| e.to_string())?;
                  fs::write(&safe_output_path, bytes).map_err(|e| e.to_string())?;
                  return Ok(());
             }
        }
    }

    // Fallback: Zip Download
    if is_folder {
        let download_url = format!("https://drive.google.com/uc?id={}&export=download", initial_id);
        if let Ok(mut response) = client.get(&download_url).send().await {
             let is_html = response.headers().get("content-type").map(|v| v.to_str().unwrap_or("")).unwrap_or("").contains("text/html");
             if is_html {
                 let text = response.text().await.unwrap_or_default();
                 if text.contains("confirm=") {
                     let re = regex::Regex::new(r"confirm=([a-zA-Z0-9_-]+)").unwrap();
                     if let Some(caps) = re.captures(&text) {
                         let code = caps.get(1).unwrap().as_str();
                         let confirm_url = format!("{}&confirm={}", download_url, code);
                         if let Ok(resp2) = client.get(&confirm_url).send().await {
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
             
             let zip_path = safe_output_path.with_extension("zip");
             {
                 let bytes = response.bytes().await.map_err(|e| e.to_string())?;
                 fs::write(&zip_path, bytes).map_err(|e| e.to_string())?;
             }

             let file = std::fs::File::open(&zip_path).map_err(|e| e.to_string())?;
             let mut archive = zip::ZipArchive::new(file).map_err(|e| format!("Invalid Zip: {}", e))?;
             
             let mut found = false;
             for i in 0..archive.len() {
                 let mut file = archive.by_index(i).unwrap();
                 if file.name().ends_with("invoices.db") {
                     let mut outfile = std::fs::File::create(&safe_output_path).map_err(|e| e.to_string())?;
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

    // FINAL FALLBACK: gdown (Python utility)
    println!("Rust download failed, attempting gdown fallback for ID: {}", initial_id);
    let mut args = vec![initial_id.as_str(), "-O"];
    let output_str = safe_output_path.to_string_lossy();
    args.push(&output_str);
    
    if is_folder {
        args.push("--folder");
    }

    // Try python3 -m gdown
    if let Ok(status) = std::process::Command::new("python3")
        .args(&["-m", "gdown"])
        .args(&args)
        .status() {
        if status.success() {
            return Ok(());
        }
    }

    // Try direct gdown command
    if let Ok(status) = std::process::Command::new("gdown")
        .args(&args)
        .status() {
        if status.success() {
            return Ok(());
        }
    }

    Err("All download methods failed. Please check your internet connection or the GDrive link.".to_string())
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
