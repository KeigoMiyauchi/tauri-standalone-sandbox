use serde::{Deserialize, Serialize};

/// デモ情報を格納する構造体
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DemoInfo {
    pub id: String,
    pub title: String,
    pub description: String,
    pub icon: String,
}

/// デモ機能を管理するサービスクラス
pub struct DemoService;

impl DemoService {

    /// 基本的な挨拶メッセージを生成
    pub fn greet(name: &str) -> String {
        if name.trim().is_empty() {
            return "Hello, World! You've been greeted from Rust!".to_string();
        }
        format!("Hello, {}! You've been greeted from Rust!", name.trim())
    }

    /// 利用可能なデモの詳細情報を取得
    pub fn get_demo_list() -> Vec<DemoInfo> {
        vec![
            DemoInfo {
                id: "hello-world".to_string(),
                title: "Hello World デモ".to_string(),
                description: "ボタンをクリックしてHello Worldメッセージを表示するシンプルなデモ".to_string(),
                icon: "👋".to_string(),
            },
            DemoInfo {
                id: "image-viewer".to_string(),
                title: "画像ビューア".to_string(),
                description: "ファイル選択ダイアログで画像を選択し、表示するデモ".to_string(),
                icon: "🖼️".to_string(),
            },
            DemoInfo {
                id: "system-info".to_string(),
                title: "システム情報".to_string(),
                description: "OS、CPU、メモリ、ディスクなどのシステム情報を表示するデモ".to_string(),
                icon: "💻".to_string(),
            },
            DemoInfo {
                id: "file-explorer".to_string(),
                title: "ファイルエクスプローラー".to_string(),
                description: "ディレクトリの内容を表示し、ファイルやフォルダを閲覧するデモ".to_string(),
                icon: "📁".to_string(),
            },
            DemoInfo {
                id: "database-memo".to_string(),
                title: "ローカルデータベースデモ".to_string(),
                description: "SQLiteを使ったメモアプリ - CRUD操作とデータの永続化".to_string(),
                icon: "💾".to_string(),
            },
            DemoInfo {
                id: "realtime-charts".to_string(),
                title: "リアルタイムグラフデモ".to_string(),
                description: "CPU・メモリ使用率をリアルタイムで線グラフ表示".to_string(),
                icon: "📊".to_string(),
            },
        ]
    }

    /// 特定のデモ情報を取得
    pub fn get_demo_info(demo_id: &str) -> Option<DemoInfo> {
        Self::get_demo_list()
            .into_iter()
            .find(|demo| demo.id == demo_id)
    }

    /// デモが有効かどうかを確認
    pub fn is_demo_available(demo_id: &str) -> bool {
        Self::get_demo_info(demo_id).is_some()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet_with_name() {
        let result = DemoService::greet("Alice");
        assert_eq!(result, "Hello, Alice! You've been greeted from Rust!");
    }

    #[test]
    fn test_greet_empty_name() {
        let result = DemoService::greet("");
        assert_eq!(result, "Hello, World! You've been greeted from Rust!");
    }

    #[test]
    fn test_greet_whitespace_name() {
        let result = DemoService::greet("  ");
        assert_eq!(result, "Hello, World! You've been greeted from Rust!");
    }

    #[test]
    fn test_get_demo_list() {
        let demos = DemoService::get_demo_list();
        assert!(!demos.is_empty());
        
        let hello_world = demos.iter().find(|d| d.id == "hello-world");
        assert!(hello_world.is_some());
        
        let hello_world = hello_world.unwrap();
        assert_eq!(hello_world.title, "Hello World デモ");
        assert!(!hello_world.description.is_empty());
        assert!(!hello_world.icon.is_empty());
    }

    #[test]
    fn test_get_demo_info() {
        let demo = DemoService::get_demo_info("hello-world");
        assert!(demo.is_some());
        
        let demo = demo.unwrap();
        assert_eq!(demo.id, "hello-world");
        assert_eq!(demo.title, "Hello World デモ");
        
        let nonexistent = DemoService::get_demo_info("nonexistent-demo");
        assert!(nonexistent.is_none());
    }

    #[test]
    fn test_is_demo_available() {
        assert!(DemoService::is_demo_available("hello-world"));
        assert!(DemoService::is_demo_available("image-viewer"));
        assert!(DemoService::is_demo_available("database-memo"));
        assert!(DemoService::is_demo_available("realtime-charts"));
        assert!(!DemoService::is_demo_available("nonexistent-demo"));
    }
}