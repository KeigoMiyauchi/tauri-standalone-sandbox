use std::fs;
use std::path::Path;
use base64::{Engine as _, engine::general_purpose};
use serde::{Deserialize, Serialize};
use tauri_plugin_dialog::DialogExt;
use sysinfo::{System, Disks};

#[derive(Serialize, Deserialize)]
struct FileInfo {
    name: String,
    size: u64,
}

#[derive(Serialize, Deserialize)]
struct DirectoryEntry {
    name: String,
    is_dir: bool,
    size: Option<u64>,
    path: String,
}

#[derive(Serialize, Deserialize)]
struct SystemInfo {
    os_name: String,
    os_version: String,
    kernel_version: String,
    hostname: String,
    cpu_brand: String,
    cpu_cores: usize,
    total_memory: u64,
    used_memory: u64,
    available_memory: u64,
    memory_usage_percent: f32,
    uptime: u64,
    disks: Vec<DiskInfo>,
}

#[derive(Serialize, Deserialize)]
struct DiskInfo {
    name: String,
    mount_point: String,
    total_space: u64,
    available_space: u64,
    used_space: u64,
    usage_percent: f32,
    file_system: String,
}

// 画像ファイル選択コマンド
#[tauri::command]
async fn select_image_file(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let dialog = app.dialog()
        .file()
        .add_filter("Images", &["png", "jpg", "jpeg", "gif", "bmp", "webp"])
        .blocking_pick_file();

    match dialog {
        Some(path) => Ok(Some(path.to_string())),
        None => Ok(None),
    }
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

// システム情報を取得するコマンド
#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    // CPU情報
    let cpu_brand = sys.global_cpu_info().brand().to_string();
    let cpu_cores = sys.cpus().len();

    // メモリ情報
    let total_memory = sys.total_memory();
    let used_memory = sys.used_memory();
    let available_memory = sys.available_memory();
    let memory_usage_percent = if total_memory > 0 {
        (used_memory as f32 / total_memory as f32) * 100.0
    } else {
        0.0
    };

    // ディスク情報
    let disks_obj = Disks::new_with_refreshed_list();
    let disks: Vec<DiskInfo> = disks_obj.iter().map(|disk| {
        let total_space = disk.total_space();
        let available_space = disk.available_space();
        let used_space = total_space - available_space;
        let usage_percent = if total_space > 0 {
            (used_space as f32 / total_space as f32) * 100.0
        } else {
            0.0
        };

        DiskInfo {
            name: disk.name().to_string_lossy().to_string(),
            mount_point: disk.mount_point().to_string_lossy().to_string(),
            total_space,
            available_space,
            used_space,
            usage_percent,
            file_system: disk.file_system().to_string_lossy().to_string(),
        }
    }).collect();

    Ok(SystemInfo {
        os_name: System::name().unwrap_or_else(|| "Unknown".to_string()),
        os_version: System::os_version().unwrap_or_else(|| "Unknown".to_string()),
        kernel_version: System::kernel_version().unwrap_or_else(|| "Unknown".to_string()),
        hostname: System::host_name().unwrap_or_else(|| "Unknown".to_string()),
        cpu_brand,
        cpu_cores,
        total_memory,
        used_memory,
        available_memory,
        memory_usage_percent,
        uptime: System::uptime(),
        disks,
    })
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

// ディレクトリ内容を取得するコマンド
#[tauri::command]
fn list_directory(dir_path: &str) -> Result<Vec<DirectoryEntry>, String> {
    let path = Path::new(dir_path);
    
    if !path.exists() {
        return Err("ディレクトリが見つかりません".to_string());
    }
    
    if !path.is_dir() {
        return Err("指定されたパスはディレクトリではありません".to_string());
    }

    let mut entries = Vec::new();
    
    let read_dir = fs::read_dir(path)
        .map_err(|e| format!("ディレクトリの読み込みに失敗しました: {}", e))?;

    for entry in read_dir {
        let entry = entry.map_err(|e| format!("エントリの読み込みに失敗しました: {}", e))?;
        let entry_path = entry.path();
        let metadata = entry.metadata().ok();
        
        let name = entry_path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("不明")
            .to_string();
            
        let is_dir = entry_path.is_dir();
        let size = if is_dir { None } else { metadata.map(|m| m.len()) };
        
        entries.push(DirectoryEntry {
            name,
            is_dir,
            size,
            path: entry_path.to_string_lossy().to_string(),
        });
    }
    
    // ディレクトリを先に、ファイルを後に、それぞれ名前順でソート
    entries.sort_by(|a, b| {
        match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.cmp(&b.name),
        }
    });
    
    Ok(entries)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            select_image_file,
            read_image_file,
            get_file_info,
            get_system_info,
            list_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
