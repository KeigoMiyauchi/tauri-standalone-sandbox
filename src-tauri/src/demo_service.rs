/// デモ機能を管理するサービスクラス
pub struct DemoService;

impl DemoService {
    /// 新しいDemoServiceインスタンスを作成
    pub fn new() -> Self {
        Self
    }

    /// 基本的な挨拶メッセージを生成
    pub fn greet(name: &str) -> String {
        if name.trim().is_empty() {
            return "Hello, World! You've been greeted from Rust!".to_string();
        }
        format!("Hello, {}! You've been greeted from Rust!", name.trim())
    }

    /// デモの一覧を取得（将来の拡張用）
    pub fn get_available_demos() -> Vec<String> {
        vec![
            "hello-world".to_string(),
            "image-viewer".to_string(),
            "system-info".to_string(),
            "file-explorer".to_string(),
        ]
    }

    /// デモが有効かどうかを確認
    pub fn is_demo_available(demo_id: &str) -> bool {
        Self::get_available_demos().contains(&demo_id.to_string())
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
    fn test_get_available_demos() {
        let demos = DemoService::get_available_demos();
        assert!(demos.contains(&"hello-world".to_string()));
        assert!(demos.contains(&"image-viewer".to_string()));
        assert!(demos.contains(&"system-info".to_string()));
        assert!(demos.contains(&"file-explorer".to_string()));
    }

    #[test]
    fn test_is_demo_available() {
        assert!(DemoService::is_demo_available("hello-world"));
        assert!(DemoService::is_demo_available("image-viewer"));
        assert!(!DemoService::is_demo_available("nonexistent-demo"));
    }
}