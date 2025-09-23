# 付録 C: 参考リンクとリソース

Tauri アプリケーション開発に役立つ公式ドキュメント、ライブラリ、ツール、学習リソースをまとめました。

## 1. 公式ドキュメント

### Tauri 公式

-   **公式サイト**: https://tauri.app/
-   **ドキュメント**: https://v2.tauri.app/
-   **API リファレンス**: https://v2.tauri.app/reference/
-   **GitHub リポジトリ**: https://github.com/tauri-apps/tauri
-   **Discord コミュニティ**: https://discord.com/invite/tauri

### Rust 関連

-   **Rust 公式サイト**: https://www.rust-lang.org/
-   **Rust ドキュメント**: https://doc.rust-lang.org/
-   **Rust by Example**: https://doc.rust-lang.org/rust-by-example/
-   **The Rust Programming Language**: https://doc.rust-lang.org/book/
-   **Cargo ドキュメント**: https://doc.rust-lang.org/cargo/

### フロントエンド技術

-   **MDN Web Docs**: https://developer.mozilla.org/
-   **TypeScript ドキュメント**: https://www.typescriptlang.org/docs/
-   **Vite ドキュメント**: https://vitejs.dev/
-   **Node.js ドキュメント**: https://nodejs.org/docs/

## 2. Tauri プラグイン

### 公式プラグイン

| プラグイン                          | 用途                 | リンク                                                                       |
| ----------------------------------- | -------------------- | ---------------------------------------------------------------------------- |
| **@tauri-apps/plugin-fs**           | ファイルシステム操作 | https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/fs           |
| **@tauri-apps/plugin-dialog**       | ダイアログ表示       | https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/dialog       |
| **@tauri-apps/plugin-shell**        | シェルコマンド実行   | https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/shell        |
| **@tauri-apps/plugin-notification** | システム通知         | https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/notification |
| **@tauri-apps/plugin-updater**      | 自動更新             | https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/updater      |
| **@tauri-apps/plugin-store**        | キーバリューストア   | https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/store        |
| **@tauri-apps/plugin-window-state** | ウィンドウ状態保存   | https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/window-state |
| **@tauri-apps/plugin-sql**          | SQL データベース     | https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/sql          |
| **@tauri-apps/plugin-http**         | HTTP リクエスト      | https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/http         |

### サードパーティプラグイン

-   **tauri-plugin-log**: ログ機能 - https://github.com/tauri-apps/tauri-plugin-log
-   **tauri-plugin-autostart**: 自動起動 - https://github.com/tauri-apps/tauri-plugin-autostart
-   **tauri-plugin-positioner**: ウィンドウ位置制御 - https://github.com/JonasKruckenberg/tauri-plugin-positioner

## 3. 開発ツール

### IDE・エディタ

-   **VS Code**: https://code.visualstudio.com/
    -   **rust-analyzer 拡張**: https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer
    -   **Tauri 拡張**: https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode
    -   **TypeScript Hero**: https://marketplace.visualstudio.com/items?itemName=rbbit.typescript-hero

### デバッグツール

-   **Chrome DevTools**: ブラウザ開発者ツール
-   **LLDB**: Rust デバッガー
-   **cargo-watch**: ファイル変更監視 - https://github.com/watchexec/cargo-watch

### ビルド・CI/CD

-   **GitHub Actions**: https://github.com/features/actions
    -   **tauri-action**: https://github.com/tauri-apps/tauri-action
-   **GitLab CI**: https://docs.gitlab.com/ee/ci/
-   **Docker**: https://www.docker.com/

## 4. UI ライブラリ・フレームワーク

### CSS フレームワーク

-   **Tailwind CSS**: https://tailwindcss.com/
-   **Bootstrap**: https://getbootstrap.com/
-   **Bulma**: https://bulma.io/
-   **Materialize CSS**: https://materializecss.com/

### JavaScript/TypeScript フレームワーク

-   **React**: https://react.dev/
-   **Vue.js**: https://vuejs.org/
-   **Svelte**: https://svelte.dev/
-   **Angular**: https://angular.io/
-   **Solid.js**: https://www.solidjs.com/

### コンポーネントライブラリ

-   **React Material-UI**: https://mui.com/
-   **Ant Design**: https://ant.design/
-   **Chakra UI**: https://chakra-ui.com/
-   **Quasar Framework**: https://quasar.dev/

## 5. データベース

### SQLite（推奨）

-   **SQLite 公式**: https://www.sqlite.org/
-   **sqlx**: Rust SQL ライブラリ - https://github.com/launchbadge/sqlx
-   **diesel**: Rust ORM - https://diesel.rs/

### その他のデータベース

-   **surrealdb**: マルチモデル DB - https://surrealdb.com/
-   **redb**: 純粋 Rust 組み込み DB - https://github.com/cberner/redb

## 6. テスト

### Rust テスト

-   **標準テスト**: https://doc.rust-lang.org/book/ch11-00-testing.html
-   **criterion**: ベンチマーク - https://github.com/bheisler/criterion.rs
-   **mockall**: モック - https://github.com/asomers/mockall

### JavaScript/TypeScript テスト

-   **Vitest**: https://vitest.dev/
-   **Jest**: https://jestjs.io/
-   **Playwright**: E2E テスト - https://playwright.dev/
-   **Cypress**: E2E テスト - https://www.cypress.io/

## 7. 学習リソース

### チュートリアル・ガイド

-   **Tauri 公式チュートリアル**: https://v2.tauri.app/start/
-   **Rust 公式チュートリアル**: https://doc.rust-lang.org/book/
-   **Web 技術チュートリアル**: https://developer.mozilla.org/docs/Learn

### 動画・コース

-   **YouTube - Tauri チャンネル**: https://www.youtube.com/@TauriApps
-   **YouTube - The Rust Programming Language**: 各種 Rust 学習動画
-   **Udemy**: 有料 Rust・Web 開発コース

### 書籍

-   **The Rust Programming Language** (The Rust Team)
-   **Programming Rust** (Jim Blandy, Jason Orendorff)
-   **Rust in Action** (Tim McNamara)
-   **Web 開発関連書籍**: JavaScript, TypeScript, HTML/CSS

## 8. コミュニティ

### フォーラム・掲示板

-   **Tauri Discord**: https://discord.com/invite/tauri
-   **Rust Users Forum**: https://users.rust-lang.org/
-   **Reddit r/rust**: https://www.reddit.com/r/rust/
-   **Stack Overflow**: https://stackoverflow.com/questions/tagged/tauri

### ブログ・記事

-   **Tauri 公式ブログ**: https://tauri.app/blog/
-   **Rust Blog**: https://blog.rust-lang.org/
-   **This Week in Rust**: https://this-week-in-rust.org/

## 9. デザイン・アイコン

### アイコン

-   **Tabler Icons**: https://tabler-icons.io/
-   **Heroicons**: https://heroicons.com/
-   **Font Awesome**: https://fontawesome.com/
-   **Material Design Icons**: https://materialdesignicons.com/

### デザインシステム

-   **Material Design**: https://material.io/design
-   **Apple Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
-   **Microsoft Fluent Design**: https://www.microsoft.com/design/fluent/

## 10. 配布・配信

### アプリストア

-   **Microsoft Store**: https://partner.microsoft.com/dashboard/
-   **Mac App Store**: https://developer.apple.com/app-store/
-   **Snapcraft**: https://snapcraft.io/
-   **Flathub**: https://flathub.org/

### 配布プラットフォーム

-   **GitHub Releases**: https://docs.github.com/releases
-   **GitLab Releases**: https://docs.gitlab.com/ee/user/project/releases/
-   **Tauri アップデータ**: 独自配信システム

## 11. パフォーマンス・監視

### プロファイリング

-   **cargo flamegraph**: https://github.com/flamegraph-rs/flamegraph
-   **perf**: Linux パフォーマンス監視
-   **Chrome DevTools Performance**: フロントエンド パフォーマンス

### 監視・ログ

-   **sentry**: エラー監視 - https://sentry.io/
-   **log4rs**: Rust ログライブラリ - https://github.com/estk/log4rs

## 12. その他の有用なツール

### 開発効率化

-   **cargo-edit**: Cargo.toml 編集 - https://github.com/killercup/cargo-edit
-   **cargo-outdated**: 依存関係更新チェック - https://github.com/kbknapp/cargo-outdated
-   **npm-check-updates**: package.json 更新 - https://github.com/raineorshine/npm-check-updates

### セキュリティ

-   **cargo-audit**: セキュリティ監査 - https://github.com/rustsec/rustsec
-   **npm audit**: npm セキュリティ監査

### コード品質

-   **clippy**: Rust リンター - https://github.com/rust-lang/rust-clippy
-   **rustfmt**: Rust フォーマッター - https://github.com/rust-lang/rustfmt
-   **ESLint**: JavaScript/TypeScript リンター - https://eslint.org/
-   **Prettier**: コードフォーマッター - https://prettier.io/

## 13. 設定例・テンプレート

### プロジェクトテンプレート

-   **create-tauri-app**: 公式テンプレート生成ツール
-   **Tauri Examples**: https://github.com/tauri-apps/tauri/tree/dev/examples
-   **Community Templates**: GitHub で "tauri template" 検索

### 設定ファイル例

```bash
# .gitignore テンプレート
# https://github.com/github/gitignore/blob/main/Rust.gitignore
# https://github.com/github/gitignore/blob/main/Node.gitignore

# .editorconfig
# https://editorconfig.org/

# GitHub Actions workflow
# https://github.com/tauri-apps/tauri-action
```

## 14. 移行ガイド

### 他技術からの移行

-   **Electron から Tauri**: https://v2.tauri.app/guides/migrate/from-electron/
-   **WPF から Web 技術**: 本ドキュメントの各章を参照
-   **Native アプリから Tauri**: モバイル開発者向けガイド

### バージョンアップ

-   **Tauri v1 から v2**: https://v2.tauri.app/guides/migrate/from-tauri-1/
-   **依存関係更新**: 定期的な更新戦略

---

これらのリソースを活用して、効率的な Tauri アプリケーション開発を進めてください。新しいツールやライブラリは継続的に登場するため、定期的に情報をアップデートすることをお勧めします。
