# スタンドアロン Tauri アプリ 新規作成手順（macOS）

このドキュメントは、空フォルダから「完全にスタンドアロン起動できる」Tauri v2 アプリを新規作成し、.app/.dmg を配布できる状態にするまでの最短手順をまとめたものです。

## 前提条件（必須ツール）

-   Node.js 18+（推奨: LTS もしくは最新安定版）
-   npm（または pnpm/yarn）
-   Rust ツールチェーン（rustup, cargo, rustc）
-   Xcode Command Line Tools（macOS のネイティブビルドに必要）

確認コマンド例（zsh）:

```zsh
node -v
npm -v
rustc --version || (curl https://sh.rustup.rs -sSf | sh -s -- -y && . "$HOME/.cargo/env")
xcode-select -p
```

## 1. プロジェクトのスキャフォルド

空のフォルダ直下で実行（カレントディレクトリに生成）:

```zsh
npm create tauri-app@latest . -- -y -m npm -t vanilla-ts --tauri-version 2 --identifier com.example.standalone
```

オプションの意味:

-   `.`: 現在のディレクトリに作る
-   `-t vanilla-ts`: フロントはバニラ + TypeScript テンプレート
-   `-m npm`: パッケージマネージャは npm（pnpm/yarn でも可）
-   `--tauri-version 2`: Tauri v2
-   `--identifier`: バンドル識別子（後から `src-tauri/tauri.conf.json` でも変更可）

## 2. 依存関係のインストール

```zsh
npm install
```

## 3. 開発モードで起動（ホットリロード）

```zsh
npm run tauri dev
```

-   フロントは Vite の dev サーバ（既定: http://localhost:1420）
-   Rust 側は変更検知で自動ビルド・再起動

## 4. 本番ビルド（スタンドアロン配布物の作成）

```zsh
npm run tauri build
```

出力先（Apple Silicon の例）:

-   .app: `src-tauri/target/release/bundle/macos/<productName>.app`
-   .dmg: `src-tauri/target/release/bundle/dmg/<productName>_<version>_aarch64.dmg`

## 5. よく行う初期設定

-   アプリ名/タイトル: `src-tauri/tauri.conf.json` の `productName`, `app.windows[0].title`
-   識別子: `identifier`
-   アイコン: `src-tauri/icons/` を差し替え（`npm run tauri icon <path>` で生成も可）
-   ウィンドウサイズ等: `app.windows` の各プロパティ

## 6. 署名と公証（配布をスムーズにする場合）

不特定多数へ配布するなら、Apple Developer の証明書でコード署名し、Apple 公証を通すと Gatekeeper 警告が減ります。

-   Developer ID Application 証明書を取得しキーチェーンに登録
-   Tauri の macOS バンドル設定で署名 ID を指定
-   CI で自動署名/公証を組むことも可能

## 7. トラブルシュート

-   `zsh: command not found: rustc` → rustup をインストール後、`. "$HOME/.cargo/env"` を読み込む
-   ビルドが止まる/遅い → 初回は依存取得で時間がかかることがあります。2 回目以降は速くなります
-   Gatekeeper 警告 → 署名・公証を行う、もしくは右クリック → 開く で一時的に回避

## 参考

-   プロジェクトルートの `README.md` にも要点を記載しています
-   Tauri 公式: https://tauri.app/
