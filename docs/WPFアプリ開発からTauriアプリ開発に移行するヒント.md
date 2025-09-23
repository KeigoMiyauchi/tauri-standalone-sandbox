# WPF から Tauri への移行ヒント（設計と実装の対応づけ）

WPF（.NET, XAML, MVVM）から Tauri（Web + Rust）へ移行する際のマッピングと実装ポイントをまとめます。

## コンセプト対応

-   ウィンドウ/ビュー
    -   WPF: Window / UserControl / XAML
    -   Tauri: `app.windows[]` + フロント（HTML/CSS/JS/フレームワーク）
-   データバインディング
    -   WPF: XAML バインディング + INotifyPropertyChanged
    -   Tauri: React/Vue/Svelte 等のリアクティブ機構（状態管理: Redux/Pinia/Zustand など）
-   コマンド/イベント
    -   WPF: ICommand, RoutedCommand
    -   Tauri: `@tauri-apps/api` で Rust の `#[tauri::command]` を呼び出し（IPC）
-   DI/サービス
    -   WPF: DI コンテナ（Unity, Autofac など）
    -   Tauri: TS 側は関数分割/コンテナ、ネイティブは Rust crates とモジュール設計

## よく使う機能の置き換え

-   ファイル/フォルダダイアログ → `@tauri-apps/api/dialog`
-   クリップボード → `@tauri-apps/api/clipboard`
-   ファイル I/O → `@tauri-apps/api/fs`（または Rust 側で高速処理）
-   設定保存 → アプリデータディレクトリ（`@tauri-apps/api/path`）+ JSON など
-   通知/トレイ/自動起動 → 対応プラグイン（tray、autostart、updater など）
-   既定アプリで開く → `@tauri-apps/plugin-opener`（本プロジェクトで導入済み）

## IPC 設計

-   ルール: 画面操作はフロント、重い処理や OS 依存は Rust
-   引数/戻り値はシリアライズ可能な構造体に（`serde`）
-   エラー時は型で返すか、`anyhow` + メッセージで UI に伝える

TypeScript 側:

```ts
import { invoke } from "@tauri-apps/api/core";

await invoke("resize_images", { files, maxSize: 2048 });
```

Rust 側:

```rust
#[derive(serde::Deserialize)]
struct ResizeArgs { files: Vec<String>, max_size: u32 }

#[tauri::command]
async fn resize_images(args: ResizeArgs) -> Result<(), String> {
  // ... 実装（エラーは String で簡易に返す例）
  Ok(())
}
```

## 配布/運用（macOS）

-   署名・公証の導入で信頼性向上
-   自動アップデートが必要なら Updater プラグイン + 配布サーバを検討
-   Intel/Apple Silicon 両対応が必要なら universal2 のビルド戦略を検討

## パフォーマンス/UX

-   起動時は必要最小限だけ読み込み、画面遷移で遅延ロード
-   画像/大容量処理は Rust 側へ（マルチスレッド/async）
-   UI はフレームワーク標準の最適化（メモ化、バッチ更新、キー付与 など）

## 移行ステップ例

1. 既存 WPF の画面フローを棚卸し（主要ユースケース/入出力/OS 連携）
2. 画面/UI をフロントで再構築、ネイティブ処理は Rust API を小さく刻んで提供
3. 1 画面ずつ動作を合わせ、E2E テストで回帰を抑制
4. 署名・公証・自動アップデート・クラッシュレポート等を段階的に導入

---

WPF の強み（堅牢なデスクトップ体験）は、Tauri でも「IPC 設計」「権限制御」「パフォーマンス配慮」で再現・強化できます。
