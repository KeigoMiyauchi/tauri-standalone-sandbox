use std::fs;
use std::path::Path;
use base64::{Engine as _, engine::general_purpose};
use serde::{Deserialize, Serialize};
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize, Deserialize, Clone)]
pub struct FileInfo {
    pub name: String,
    pub size: u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DirectoryEntry {
    pub name: String,
    pub is_dir: bool,
    pub size: Option<u64>,
    pub path: String,
}

/// ファイル操作を担当するサービスクラス
pub struct FileService;

impl FileService {
    
    /// 画像ファイル選択ダイアログを表示
    pub async fn select_image_file(app: &tauri::AppHandle) -> Result<Option<String>, String> {
        let dialog = app.dialog()
            .file()
            .add_filter("Images", &["png", "jpg", "jpeg", "gif", "bmp", "webp"])
            .blocking_pick_file();

        match dialog {
            Some(path) => Ok(Some(path.to_string())),
            None => Ok(None),
        }
    }

    /// 画像ファイルを読み込んでBase64エンコードして返す
    pub fn read_image_file(file_path: &str) -> Result<String, String> {
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

    /// ファイル情報を取得
    pub fn get_file_info(file_path: &str) -> Result<FileInfo, String> {
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

    /// ディレクトリ内容を取得
    pub fn list_directory(dir_path: &str) -> Result<Vec<DirectoryEntry>, String> {
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    #[test]
    fn test_get_file_info_nonexistent() {
        let result = FileService::get_file_info("/nonexistent/path");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "ファイルが見つかりません");
    }

    #[test]
    fn test_list_directory_nonexistent() {
        let result = FileService::list_directory("/nonexistent/directory");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "ディレクトリが見つかりません");
    }
}