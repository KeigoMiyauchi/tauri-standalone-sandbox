// モジュール分割
mod file_service;
mod system_service;
mod demo_service;
mod database_service;

use file_service::FileService;
use system_service::SystemService;
use demo_service::DemoService;
use database_service::DatabaseService;

// 型定義を各サービスモジュールから再エクスポート
pub use file_service::{FileInfo, DirectoryEntry};
pub use system_service::{SystemInfo, DiskInfo, RealTimeMetrics};
pub use database_service::{Memo, CreateMemoRequest, UpdateMemoRequest};

// ========== Tauri コマンド層 ==========
// この層は薄いラッパーとして機能し、サービス層に処理を委譲する

/// 画像ファイル選択コマンド - UIからファイル選択ダイアログを開く
#[tauri::command]
async fn select_image_file(app: tauri::AppHandle) -> Result<Option<String>, String> {
    FileService::select_image_file(&app).await
}

/// 挨拶メッセージ生成コマンド - デモ用の基本機能
#[tauri::command]
fn greet(name: &str) -> String {
    DemoService::greet(name)
}

/// 画像ファイル読み込みコマンド - ファイルをBase64エンコードして返す
#[tauri::command]
fn read_image_file(file_path: &str) -> Result<String, String> {
    FileService::read_image_file(file_path)
}

/// システム情報取得コマンド - OS、CPU、メモリ、ディスク情報を取得
#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    SystemService::get_system_info()
}

/// リアルタイムメトリクス取得コマンド - CPU、メモリ使用率をリアルタイムで取得
#[tauri::command]
fn get_realtime_metrics() -> Result<RealTimeMetrics, String> {
    SystemService::get_realtime_metrics()
}

/// ファイル情報取得コマンド - 指定されたファイルの詳細情報を取得
#[tauri::command]
fn get_file_info(file_path: &str) -> Result<FileInfo, String> {
    FileService::get_file_info(file_path)  
}

/// ディレクトリ一覧取得コマンド - 指定されたディレクトリ内のファイル・フォルダ一覧を取得
#[tauri::command]
fn list_directory(dir_path: &str) -> Result<Vec<DirectoryEntry>, String> {
    FileService::list_directory(dir_path)
}

// ========== データベース操作コマンド ==========

/// メモ作成コマンド - 新しいメモをデータベースに保存
#[tauri::command]
fn create_memo(app: tauri::AppHandle, request: CreateMemoRequest) -> Result<Memo, String> {
    let db_service = DatabaseService::new(&app)?;
    db_service.create_memo(request)
}

/// 全メモ取得コマンド - データベースから全てのメモを取得
#[tauri::command]
fn get_all_memos(app: tauri::AppHandle) -> Result<Vec<Memo>, String> {
    let db_service = DatabaseService::new(&app)?;
    db_service.get_all_memos()
}

/// メモ取得コマンド - IDを指定してメモを取得
#[tauri::command]
fn get_memo_by_id(app: tauri::AppHandle, id: i32) -> Result<Option<Memo>, String> {
    let db_service = DatabaseService::new(&app)?;
    db_service.get_memo_by_id(id)
}

/// メモ更新コマンド - 既存のメモを更新
#[tauri::command]
fn update_memo(app: tauri::AppHandle, request: UpdateMemoRequest) -> Result<Memo, String> {
    let db_service = DatabaseService::new(&app)?;
    db_service.update_memo(request)
}

/// メモ削除コマンド - 指定されたIDのメモを削除
#[tauri::command]
fn delete_memo(app: tauri::AppHandle, id: i32) -> Result<bool, String> {
    let db_service = DatabaseService::new(&app)?;
    db_service.delete_memo(id)
}

/// メモ検索コマンド - キーワードでメモを検索
#[tauri::command]
fn search_memos(app: tauri::AppHandle, query: String) -> Result<Vec<Memo>, String> {
    let db_service = DatabaseService::new(&app)?;
    db_service.search_memos(&query)
}

/// データベース統計取得コマンド - データベースの統計情報を取得
#[tauri::command]
fn get_database_stats(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let db_service = DatabaseService::new(&app)?;
    db_service.get_database_stats()
}

// ========== アプリケーション設定・起動 ==========

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // デモ機能
            greet,
            // ファイル操作
            select_image_file,
            read_image_file,
            get_file_info,
            list_directory,
            // システム情報
            get_system_info,
            get_realtime_metrics,
            // データベース操作
            create_memo,
            get_all_memos,
            get_memo_by_id,
            update_memo,
            delete_memo,
            search_memos,
            get_database_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ========== テスト用モジュール ==========
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet_command() {
        let result = greet("Test User");
        assert!(result.contains("Test User"));
        assert!(result.contains("Hello"));
    }

    #[test]
    fn test_get_system_info_command() {
        let result = get_system_info();
        assert!(result.is_ok());
    }
}
