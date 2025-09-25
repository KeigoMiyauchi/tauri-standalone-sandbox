# Windows 開発環境セットアップガイド

## 前提条件

### 1. Node.js

```bash
# Node.js 18以降をインストール
winget install OpenJS.NodeJS
# または公式サイトからダウンロード: https://nodejs.org/
```

### 2. Rust

```bash
# Rustupを使用してRustをインストール
# https://rustup.rs/ からダウンロードして実行
rustup-init.exe

# インストール後、新しいターミナルで確認
rustc --version
cargo --version
```

### 3. Build Tools for Visual Studio

```bash
# Visual Studio Build Tools 2022をインストール
winget install Microsoft.VisualStudio.2022.BuildTools

# または Visual Studio Installerから以下をインストール:
# - C++ build tools
# - Windows 10/11 SDK
```

## プロジェクトセットアップ

### 1. プロジェクトクローン

```bash
git clone <repository-url>
cd standaloneTauriProject
```

### 2. 依存関係インストール

```bash
npm install
```

### 3. 開発サーバー起動

#### 静的ファイルモード

```bash
npm run tauri:dev
```

#### React 開発モード

```bash
npm run tauri:dev:react
```

## Windows 固有の注意事項

### パス区切り文字

-   Windows ではバックスラッシュ(`\`)が使用されますが、本アプリケーションでは自動変換されます

### ファイアウォール設定

-   初回起動時に Windows Defender から許可を求められる場合があります

### パフォーマンス

-   Windows Defender のリアルタイム保護により、ビルド時間が長くなる場合があります
-   除外設定を追加することで改善可能：
    ```
    除外パス: プロジェクトフォルダ\target\
    除外パス: プロジェクトフォルダ\node_modules\
    ```

## トラブルシューティング

### ビルドエラー

```bash
# Rust依存関係の再ビルド
cargo clean
cargo build

# Node.js依存関係の再インストール
rm -rf node_modules package-lock.json
npm install
```

### 権限エラー

```bash
# 管理者権限でターミナルを起動してから実行
```

### WebView2 エラー

-   Windows 10/11 には通常プリインストールされていますが、古いバージョンの場合は以下からインストール：
-   https://developer.microsoft.com/en-us/microsoft-edge/webview2/
