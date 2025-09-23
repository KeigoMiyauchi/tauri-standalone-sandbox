# スタンドアロン Tauri アプリの開発方法・注意点（v2）

本書は「アプリ内にフロント資産を同梱する」スタンドアロン構成の開発フローと、品質・セキュリティ・配布での注意点をまとめたものです。

## 開発フロー（デスクトップ）

-   起動: `npm run tauri dev`
    -   Vite dev サーバ: `tauri.conf.json` の `build.devUrl`（既定: http://localhost:1420）
    -   Rust 側: ホットリロード（ファイル監視で自動再ビルド）
-   本番ビルド: `npm run tauri build`
    -   `vite build` の `dist/` を `build.frontendDist` 経由で同梱し、オフライン実行可能

## Tauri 設定の要点（`src-tauri/tauri.conf.json`）

-   `build.beforeDevCommand`/`beforeBuildCommand`/`frontendDist`/`devUrl`
-   `app.windows[]` でウィンドウ設定（タイトル、サイズ、フレーム有無、リサイズ可否など）
-   `app.security.csp` は適切に設定（テンプレは `null`）。本番は `script-src` 等を厳格化推奨
-   `bundle.targets`/`icon` でバンドル対象やアイコン

## Rust 側の実装ポイント

-   コマンド定義: `#[tauri::command]` を付けた関数を用意し、Builder に登録
-   非同期処理: tokio を使い、重い処理はブロッキング回避（`spawn_blocking` 等）
-   エラーハンドリング: `anyhow`/`thiserror`/`Result` で失敗理由をログに残す
-   ログ出力: `RUST_LOG=info` 等の環境変数や `tauri::async_runtime::spawn` でのログを活用

TypeScript から Rust コマンド呼び出し例:

```ts
import { invoke } from "@tauri-apps/api/core";

const result = await invoke<string>("greet", { name: "Tauri" });
```

Rust 側の対応（例）:

```rust
#[tauri::command]
async fn greet(name: String) -> String { format!("Hello, {}", name) }

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

## セキュリティの注意点

-   CSP を有効にして `script-src` を自己ホスト資産へ限定、`unsafe-eval`/`unsafe-inline` を避ける
-   外部ドメインへアクセスする場合はドメインを明示し、IPC 経路を最小化
-   机上テストだけでなく実機ビルドで挙動/権限を確認

## パフォーマンスの注意点

-   フロントのバンドルサイズ削減（Tree Shaking、コード分割、画像の最適化）
-   不要なレンダリングを抑制（仮想 DOM/リアクティブフレームワークの特性を理解）
-   Rust 側で重い処理を非同期に逃がし UI スレッドを塞がない
-   ウィンドウ起動時の初期化を最小限に（遅延ロード）

## OS/配布の注意点（macOS）

-   署名・公証で Gatekeeper の警告を抑制
-   Apple Silicon/Intel のアーキテクチャ差（universal2 へしたい場合は追加設定が必要）
-   サンドボックスではないため、権限は自制的に制約する（必要最小限の API 使用）

## テスト

-   フロント: 単体テスト（Vitest/Jest）+ E2E（Playwright）
-   Rust: 単体テスト（`cargo test`）とコマンド単位のテスト
-   結合: `tauri-driver` + E2E で UI と IPC の疎通確認も有効

---

最小限のテンプレで始め、必要なプラグインや権限だけを足すのが安全・高品質への近道です。
