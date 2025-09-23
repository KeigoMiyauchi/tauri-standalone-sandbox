use std::fs;
use std::path::Path;
use base64::{Engine as _, engine::general_purpose};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct FileInfo {
    name: String,
    size: u64,
}

// 既存のgreetコマンド
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 画像ファイルを読み込んでBase64で返すコマンド
#[tauri::command]
fn read_image_file(file_path: &str) -> Result<String, String> {
    // ファイルの存在確認
    if !Path::new(file_path).exists() {
        return Err("ファイルが見つかりません".to_string());
    }

    // ファイル拡張子の確認
    let allowed_extensions = ["jpg", "jpeg", "png", "gif", "webp"];
    let extension = Path::new(file_path)
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_lowercase());

    match extension {
        Some(ext) if allowed_extensions.contains(&ext.as_str()) => {
            // ファイルを読み込み
            match fs::read(file_path) {
                Ok(bytes) => {
                    // Base64エンコード
                    let encoded = general_purpose::STANDARD.encode(&bytes);
                    Ok(encoded)
                }
                Err(e) => Err(format!("ファイルの読み込みに失敗しました: {}", e)),
            }
        }
        Some(_) => Err("サポートされていないファイル形式です".to_string()),
        None => Err("ファイル拡張子が不明です".to_string()),
    }
}

// ファイル情報を取得するコマンド
#[tauri::command]
fn get_file_info(file_path: &str) -> Result<FileInfo, String> {
    let path = Path::new(file_path);
    
    if !path.exists() {
        return Err("ファイルが見つかりません".to_string());
    }

    let metadata = fs::metadata(path)
        .map_err(|e| format!("ファイル情報の取得に失敗しました: {}", e))?;

    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("不明")
        .to_string();

    Ok(FileInfo {
        name: file_name,
        size: metadata.len(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            read_image_file,
            get_file_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
