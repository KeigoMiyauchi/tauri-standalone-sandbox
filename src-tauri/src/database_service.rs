use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use chrono::Utc;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Memo {
    pub id: Option<i32>,
    pub title: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CreateMemoRequest {
    pub title: String,
    pub content: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UpdateMemoRequest {
    pub id: i32,
    pub title: String,
    pub content: String,
}

/// データベース操作を担当するサービスクラス
pub struct DatabaseService {
    db_path: PathBuf,
}

impl DatabaseService {
    /// 新しいDatabaseServiceインスタンスを作成
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self, String> {
        // アプリのデータディレクトリを取得
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .map_err(|e| format!("アプリデータディレクトリの取得に失敗しました: {}", e))?;

        // ディレクトリが存在しない場合は作成
        if !app_dir.exists() {
            std::fs::create_dir_all(&app_dir)
                .map_err(|e| format!("ディレクトリの作成に失敗しました: {}", e))?;
        }

        let db_path = app_dir.join("memos.db");
        
        let service = Self { db_path };
        
        // データベーステーブルを初期化
        service.init_database()?;
        
        Ok(service)
    }

    /// データベースとテーブルを初期化
    fn init_database(&self) -> Result<(), String> {
        let conn = self.get_connection()?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS memos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        ).map_err(|e| format!("テーブル作成に失敗しました: {}", e))?;

        Ok(())
    }

    /// データベース接続を取得
    fn get_connection(&self) -> Result<Connection, String> {
        Connection::open(&self.db_path)
            .map_err(|e| format!("データベース接続に失敗しました: {}", e))
    }

    /// 新しいメモを作成
    pub fn create_memo(&self, request: CreateMemoRequest) -> Result<Memo, String> {
        let conn = self.get_connection()?;
        let now = Utc::now().to_rfc3339();

        let mut stmt = conn.prepare(
            "INSERT INTO memos (title, content, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4)"
        ).map_err(|e| format!("SQL準備に失敗しました: {}", e))?;

        stmt.execute(params![request.title, request.content, now, now])
            .map_err(|e| format!("メモの作成に失敗しました: {}", e))?;

        let memo_id = conn.last_insert_rowid() as i32;

        Ok(Memo {
            id: Some(memo_id),
            title: request.title,
            content: request.content,
            created_at: now.clone(),
            updated_at: now,
        })
    }

    /// すべてのメモを取得
    pub fn get_all_memos(&self) -> Result<Vec<Memo>, String> {
        let conn = self.get_connection()?;
        
        let mut stmt = conn.prepare(
            "SELECT id, title, content, created_at, updated_at FROM memos ORDER BY updated_at DESC"
        ).map_err(|e| format!("SQL準備に失敗しました: {}", e))?;

        let memo_iter = stmt.query_map([], |row| {
            Ok(Memo {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        }).map_err(|e| format!("メモの取得に失敗しました: {}", e))?;

        let mut memos = Vec::new();
        for memo in memo_iter {
            memos.push(memo.map_err(|e| format!("メモのパースに失敗しました: {}", e))?);
        }

        Ok(memos)
    }

    /// IDでメモを取得
    pub fn get_memo_by_id(&self, id: i32) -> Result<Option<Memo>, String> {
        let conn = self.get_connection()?;
        
        let mut stmt = conn.prepare(
            "SELECT id, title, content, created_at, updated_at FROM memos WHERE id = ?1"
        ).map_err(|e| format!("SQL準備に失敗しました: {}", e))?;

        let mut memo_iter = stmt.query_map(params![id], |row| {
            Ok(Memo {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        }).map_err(|e| format!("メモの取得に失敗しました: {}", e))?;

        match memo_iter.next() {
            Some(memo) => Ok(Some(memo.map_err(|e| format!("メモのパースに失敗しました: {}", e))?)),
            None => Ok(None),
        }
    }

    /// メモを更新
    pub fn update_memo(&self, request: UpdateMemoRequest) -> Result<Memo, String> {
        let conn = self.get_connection()?;
        let now = Utc::now().to_rfc3339();

        let updated_rows = conn.execute(
            "UPDATE memos SET title = ?1, content = ?2, updated_at = ?3 WHERE id = ?4",
            params![request.title, request.content, now, request.id],
        ).map_err(|e| format!("メモの更新に失敗しました: {}", e))?;

        if updated_rows == 0 {
            return Err("指定されたIDのメモが見つかりません".to_string());
        }

        // 更新されたメモを取得して返す
        self.get_memo_by_id(request.id)?
            .ok_or_else(|| "更新後のメモの取得に失敗しました".to_string())
    }

    /// メモを削除
    pub fn delete_memo(&self, id: i32) -> Result<bool, String> {
        let conn = self.get_connection()?;

        let deleted_rows = conn.execute(
            "DELETE FROM memos WHERE id = ?1",
            params![id],
        ).map_err(|e| format!("メモの削除に失敗しました: {}", e))?;

        Ok(deleted_rows > 0)
    }

    /// メモの検索
    pub fn search_memos(&self, query: &str) -> Result<Vec<Memo>, String> {
        let conn = self.get_connection()?;
        
        let search_query = format!("%{}%", query);
        let mut stmt = conn.prepare(
            "SELECT id, title, content, created_at, updated_at FROM memos 
             WHERE title LIKE ?1 OR content LIKE ?1 
             ORDER BY updated_at DESC"
        ).map_err(|e| format!("SQL準備に失敗しました: {}", e))?;

        let memo_iter = stmt.query_map(params![search_query], |row| {
            Ok(Memo {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        }).map_err(|e| format!("メモの検索に失敗しました: {}", e))?;

        let mut memos = Vec::new();
        for memo in memo_iter {
            memos.push(memo.map_err(|e| format!("メモのパースに失敗しました: {}", e))?);
        }

        Ok(memos)
    }

    /// データベース統計を取得
    pub fn get_database_stats(&self) -> Result<serde_json::Value, String> {
        let conn = self.get_connection()?;
        
        let mut stmt = conn.prepare("SELECT COUNT(*) FROM memos")
            .map_err(|e| format!("SQL準備に失敗しました: {}", e))?;
        
        let total_memos: i32 = stmt.query_row([], |row| row.get(0))
            .map_err(|e| format!("統計取得に失敗しました: {}", e))?;

        Ok(serde_json::json!({
            "total_memos": total_memos,
            "database_path": self.db_path.to_string_lossy(),
            "database_size": self.get_database_file_size()?
        }))
    }

    /// データベースファイルサイズを取得
    fn get_database_file_size(&self) -> Result<u64, String> {
        if self.db_path.exists() {
            std::fs::metadata(&self.db_path)
                .map(|metadata| metadata.len())
                .map_err(|e| format!("ファイルサイズ取得に失敗しました: {}", e))
        } else {
            Ok(0)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_db_service() -> (DatabaseService, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test_memos.db");
        let service = DatabaseService { db_path };
        service.init_database().unwrap();
        (service, temp_dir)
    }

    #[test]
    fn test_create_and_get_memo() {
        let (service, _temp_dir) = create_test_db_service();
        
        let request = CreateMemoRequest {
            title: "テストメモ".to_string(),
            content: "これはテスト用のメモです".to_string(),
        };

        let created_memo = service.create_memo(request).unwrap();
        assert!(created_memo.id.is_some());
        assert_eq!(created_memo.title, "テストメモ");

        let retrieved_memo = service.get_memo_by_id(created_memo.id.unwrap()).unwrap();
        assert!(retrieved_memo.is_some());
        assert_eq!(retrieved_memo.unwrap().title, "テストメモ");
    }

    #[test]
    fn test_update_memo() {
        let (service, _temp_dir) = create_test_db_service();
        
        let create_request = CreateMemoRequest {
            title: "元のタイトル".to_string(),
            content: "元の内容".to_string(),
        };

        let created_memo = service.create_memo(create_request).unwrap();
        let memo_id = created_memo.id.unwrap();

        let update_request = UpdateMemoRequest {
            id: memo_id,
            title: "更新されたタイトル".to_string(),
            content: "更新された内容".to_string(),
        };

        let updated_memo = service.update_memo(update_request).unwrap();
        assert_eq!(updated_memo.title, "更新されたタイトル");
        assert_eq!(updated_memo.content, "更新された内容");
    }

    #[test]
    fn test_delete_memo() {
        let (service, _temp_dir) = create_test_db_service();
        
        let request = CreateMemoRequest {
            title: "削除テスト".to_string(),
            content: "このメモは削除されます".to_string(),
        };

        let created_memo = service.create_memo(request).unwrap();
        let memo_id = created_memo.id.unwrap();

        let deleted = service.delete_memo(memo_id).unwrap();
        assert!(deleted);

        let retrieved_memo = service.get_memo_by_id(memo_id).unwrap();
        assert!(retrieved_memo.is_none());
    }

    #[test]
    fn test_search_memos() {
        let (service, _temp_dir) = create_test_db_service();
        
        service.create_memo(CreateMemoRequest {
            title: "検索テスト1".to_string(),
            content: "キーワード含有".to_string(),
        }).unwrap();

        service.create_memo(CreateMemoRequest {
            title: "テスト2".to_string(),
            content: "別の内容".to_string(),
        }).unwrap();

        let results = service.search_memos("キーワード").unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "検索テスト1");
    }
}