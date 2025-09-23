# スタンドアロン Tauri アプリ作成手順（macOS）

このプロジェクトは「完全にスタンドアロン起動する Tauri アプリ」を空フォルダから作成したサンプルです。WPF の代替としての最小構成で、.app/.dmg を生成して配布できます。

## 必要なツール

-   Node.js 18+（本プロジェクトでは 24.x）
-   npm（または pnpm/yarn）
-   Rust (rustup, cargo)
-   Xcode Command Line Tools（ビルドに必要）

## 初回セットアップ手順

1. 依存関係のインストール
    - `npm install`
2. 開発モードで起動
    - `npm run tauri dev`
    - 変更を保存すると自動リロードされます。
3. リリースビルド（スタンドアロン配布）
    - `npm run tauri build`
    - 生成物：
        - `.app`: `src-tauri/target/release/bundle/macos/tauri-app.app`
        - `.dmg`: `src-tauri/target/release/bundle/dmg/tauri-app_0.1.0_aarch64.dmg`

## フロントエンド構成

-   Vite + TypeScript + バニラ（HTML/CSS/TS）
-   開発用サーバのポートは `tauri.conf.json` の `devUrl` で 1420 番。

## バックエンド（Rust/Tauri）

-   Rust 側エントリは `src-tauri/src/main.rs`
-   設定は `src-tauri/tauri.conf.json`
-   依存は `src-tauri/Cargo.toml`

## よくある質問

-   アイコン変更
    -   `src-tauri/icons/` を差し替えます。`npm run tauri icon <path>` も利用可能。
-   アプリアイデンティファイア
    -   `tauri.conf.json` の `identifier`（例: `com.example.standalone`）
-   自動アップデートやプラグイン
    -   `@tauri-apps/plugin-*` 系を追加して `tauri.conf.json` に反映します。

## ライセンス

自由に改変可。商用利用時は各依存のライセンスもご確認ください。
