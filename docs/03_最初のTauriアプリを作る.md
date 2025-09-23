# 03. 最初の Tauri アプリを作る

WPF で「Hello World」アプリを作るように、Tauri でも基本的なアプリケーションを作成します。Visual Studio で「新しいプロジェクト」を作成するのと同じような手順です。

## プロジェクトの作成

### 1. 新しいフォルダの作成

```bash
# プロジェクト用フォルダを作成
mkdir ~/my-first-tauri-app
cd ~/my-first-tauri-app
```

### 2. Tauri プロジェクトの初期化

WPF プロジェクトテンプレートと同様に、Tauri も公式テンプレートを提供しています：

```bash
# Tauri アプリを作成（現在のフォルダに）
npm create tauri-app@latest . -- -y -m npm -t vanilla-ts --tauri-version 2 --identifier com.mycompany.myfirstapp

# パラメータの意味：
# .                    : 現在のフォルダに作成
# -y                   : すべての質問に「はい」で回答
# -m npm              : npm を使用
# -t vanilla-ts       : バニラ TypeScript テンプレート
# --tauri-version 2   : Tauri v2 を使用
# --identifier        : アプリの一意識別子（WPFのAssemblyInfoに相当）
```

### 3. 依存関係のインストール

```bash
# Node.js の依存関係をインストール
npm install
```

これで基本的なプロジェクト構造が作成されます。

## プロジェクト構造の確認

VS Code でプロジェクトを開いて構造を確認します：

```bash
code .
```

作成されたファイル構造：

```
my-first-tauri-app/
├── index.html          # メインのHTMLファイル（WPFのMainWindow.xamlに相当）
├── src/
│   ├── main.ts         # TypeScriptのエントリポイント（MainWindow.xaml.csに相当）
│   └── style.css       # スタイルシート（WPFのStyleに相当）
├── src-tauri/
│   ├── src/
│   │   └── main.rs     # Rustのメインファイル（Program.csやApp.xaml.csに相当）
│   ├── Cargo.toml      # Rust依存関係（.csprojに相当）
│   └── tauri.conf.json # Tauri設定（WPFのapp.configに相当）
├── package.json        # Node.js依存関係とスクリプト
└── README.md
```

## アプリケーションの実行

### 開発モードでの実行

WPF で F5 キーを押してデバッグ実行するのと同様に、Tauri では以下のコマンドを使います：

```bash
npm run tauri dev
```

**初回実行時の注意:**

-   Rust のコンパイルがあるため、初回は 5-15 分程度かかります
-   「Downloading and Compiling...」の表示は正常です
-   2 回目以降は高速（10-30 秒程度）になります

成功すると、小さなウィンドウが開いて以下のような画面が表示されます：

-   タイトル: "tauri-app"
-   画面に "Welcome to Tauri!" のメッセージ
-   複数のボタンやリンク

## 基本的なコードの理解

### index.html（メイン UI）

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tauri + Vanilla TS</title>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to Tauri!</h1>

            <div class="row">
                <a href="https://vitejs.dev" target="_blank">
                    <img src="/vite.svg" class="logo vite" alt="Vite logo" />
                </a>
                <a href="https://tauri.app" target="_blank">
                    <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
                </a>
            </div>

            <p>Click on the Tauri, Vite, and TypeScript logos to learn more.</p>

            <form class="row">
                <input id="greet-input" placeholder="Enter a name..." />
                <button type="submit">Greet</button>
            </form>
            <p id="greet-msg"></p>
        </div>

        <script type="module" src="/src/main.ts"></script>
    </body>
</html>
```

### src/main.ts（フロントエンドロジック）

```typescript
import { invoke } from "@tauri-apps/api/core";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

async function greet() {
    if (greetMsgEl && greetInputEl) {
        // Rustのgreet関数を呼び出し
        greetMsgEl.textContent = await invoke("greet", {
            name: greetInputEl.value,
        });
    }
}

window.addEventListener("DOMContentLoaded", () => {
    greetInputEl = document.querySelector("#greet-input");
    greetMsgEl = document.querySelector("#greet-msg");
    document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        greet();
    });
});
```

### src-tauri/src/main.rs（バックエンドロジック）

```rust
// Prevents additional console window on Windows in release, similar to app.manifest
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## コードの動作の流れ

1. **ユーザーがテキストボックスに名前を入力**
2. **「Greet」ボタンをクリック**
3. **TypeScript の `greet()` 関数が実行される**
4. **`invoke("greet", { name })` で Rust の関数を呼び出し**
5. **Rust の `greet` 関数が文字列を生成して返す**
6. **TypeScript が結果を受け取り、画面に表示**

この流れは、WPF でボタンクリックイベントからビジネスロジックを呼び出すのと似ています。

## アプリケーションのビルド

開発が完了したら、配布用のアプリケーションをビルドします：

```bash
npm run tauri build
```

ビルド成果物の場所（macOS の場合）：

-   **アプリケーション**: `src-tauri/target/release/bundle/macos/tauri-app.app`
-   **インストーラー**: `src-tauri/target/release/bundle/dmg/tauri-app_0.1.0_aarch64.dmg`

## WPF との比較

| 操作                | WPF                                | Tauri                  |
| ------------------- | ---------------------------------- | ---------------------- |
| プロジェクト作成    | Visual Studio > 新しいプロジェクト | `npm create tauri-app` |
| 依存関係管理        | NuGet Package Manager              | npm install            |
| デバッグ実行        | F5 キー                            | `npm run tauri dev`    |
| リリースビルド      | ビルド > ソリューションのビルド    | `npm run tauri build`  |
| フロント-バック通信 | 直接メソッド呼び出し               | IPC (invoke)           |

## 実習: 簡単なカスタマイズ

テンプレートアプリを少しカスタマイズしてみましょう：

### 1. ウィンドウタイトルの変更

`src-tauri/tauri.conf.json` を開き：

```json
{
    "app": {
        "windows": [
            {
                "title": "私の最初のTauriアプリ",
                "width": 800,
                "height": 600
            }
        ]
    }
}
```

### 2. メッセージのカスタマイズ

`src-tauri/src/main.rs` の greet 関数を変更：

```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("こんにちは、{}さん！Tauriへようこそ！", name)
}
```

### 3. 変更の確認

```bash
npm run tauri dev
```

ウィンドウタイトルが変わり、日本語のメッセージが表示されることを確認してください。

## 次のステップ

基本的なアプリケーションが動作したら、[04\_プロジェクト構造の理解.md](./04_プロジェクト構造の理解.md) でプロジェクト構造をより詳しく理解しましょう。
