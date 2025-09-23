# 付録 B: トラブルシューティングガイド

Tauri アプリケーション開発でよく遭遇する問題と解決方法をまとめました。

## 1. 環境構築・インストール関連

### Node.js 関連エラー

**問題: `npm install` でエラーが発生する**

```bash
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**解決方法:**

```bash
# 1. Node.jsのパーミッション修正
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# 2. または、nvm を使用してNode.jsを管理
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

**問題: `node-gyp` でネイティブモジュールのビルドに失敗**

**解決方法:**

```bash
# macOS
xcode-select --install

# 必要に応じてPythonも設定
npm config set python python3
```

### Rust 関連エラー

**問題: `rustc` が見つからない**

```bash
error: Microsoft Visual C++ 14.0 is required
```

**解決方法:**

```bash
# Rust再インストール
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Windows の場合、Build Tools for Visual Studio が必要
# https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

**問題: Cargo.lock の競合**

```bash
error: the lock file needs to be updated
```

**解決方法:**

```bash
cd src-tauri
cargo update
```

### Tauri CLI 関連エラー

**問題: `tauri` コマンドが見つからない**

**解決方法:**

```bash
# ローカルインストール（推奨）
npm install --save-dev @tauri-apps/cli

# グローバルインストール
npm install -g @tauri-apps/cli

# または Cargo から
cargo install tauri-cli
```

## 2. 開発時のエラー

### ビルドエラー

**問題: フロントエンドビルドでエラー**

```bash
Error: Cannot resolve module './src/main.ts'
```

**解決方法:**

```typescript
// vite.config.ts を確認
import { defineConfig } from "vite";

export default defineConfig({
    clearScreen: false,
    server: {
        port: 1420,
        strictPort: true,
        watch: {
            ignored: ["**/src-tauri/**"],
        },
    },
    build: {
        target: process.env.TAURI_DEBUG ? "esnext" : "es2021",
        minify: !process.env.TAURI_DEBUG,
        sourcemap: !!process.env.TAURI_DEBUG,
    },
});
```

**問題: Tauri 設定ファイルエラー**

```bash
Error: invalid type: null, expected a string
```

**解決方法:**

```json
// src-tauri/tauri.conf.json を修正
{
    "app": {
        "withGlobalTauri": false,
        "windows": [
            {
                "title": "Tauri App",
                "width": 800,
                "height": 600
            }
        ]
    }
}
```

### ランタイムエラー

**問題: `invoke` 呼び出しでエラー**

```javascript
Error: failed to invoke command
```

**解決方法:**

```typescript
// 1. コマンドがexportされているか確認
#[tauri::command]
fn my_command() -> String {
    "Hello".to_string()
}

// 2. main.rsでハンドラーに登録されているか確認
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![my_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// 3. フロントエンドでコマンド名が正確か確認
import { invoke } from '@tauri-apps/api/core';

const result = await invoke('my_command'); // アンダースコアをハイフンに
```

**問題: ファイルアクセス権限エラー**

```bash
Error: path not allowed by scope
```

**解決方法:**

```json
// src-tauri/tauri.conf.json
{
    "allowlist": {
        "fs": {
            "all": false,
            "readFile": true,
            "writeFile": true,
            "readDir": true,
            "copyFile": true,
            "createDir": true,
            "removeDir": true,
            "removeFile": true,
            "renameFile": true,
            "exists": true,
            "scope": ["$APPDATA/*", "$DOCUMENT/*", "$HOME/Documents/*"]
        }
    }
}
```

## 3. Rust 特有のエラー

### 型システム関連

**問題: ライフタイム指定エラー**

```rust
error[E0597]: `data` does not live long enough
```

**解決方法:**

```rust
// 問題のあるコード
#[tauri::command]
fn get_data() -> &str {
    let data = "Hello".to_string();
    &data // dataがスコープを出るとドロップされる
}

// 修正されたコード
#[tauri::command]
fn get_data() -> String {
    "Hello".to_string() // 所有権を移譲
}

// または静的文字列リテラル
#[tauri::command]
fn get_data() -> &'static str {
    "Hello"
}
```

**問題: 借用エラー**

```rust
error[E0502]: cannot borrow as mutable because it is also borrowed as immutable
```

**解決方法:**

```rust
// 問題のあるコード
let mut data = vec![1, 2, 3];
let first = &data[0];
data.push(4); // エラー

// 修正されたコード
let mut data = vec![1, 2, 3];
{
    let first = &data[0];
    println!("First: {}", first);
} // first の借用がここで終了
data.push(4); // OK

// または clone を使用
let mut data = vec![1, 2, 3];
let first = data[0]; // Copy trait があるので clone される
data.push(4); // OK
```

### 非同期処理エラー

**問題: async 関数内でのブロッキング操作**

```rust
error: cannot block on a future within an async context
```

**解決方法:**

```rust
// 問題のあるコード
#[tauri::command]
async fn bad_async_function() -> Result<String, String> {
    let result = std::fs::read_to_string("file.txt"); // ブロッキング
    Ok(result.unwrap())
}

// 修正されたコード
#[tauri::command]
async fn good_async_function() -> Result<String, String> {
    let result = tokio::fs::read_to_string("file.txt").await; // 非同期
    result.map_err(|e| e.to_string())
}

// またはspawn_blockingを使用
#[tauri::command]
async fn mixed_async_function() -> Result<String, String> {
    let result = tokio::task::spawn_blocking(|| {
        std::fs::read_to_string("file.txt")
    }).await;

    match result {
        Ok(Ok(content)) => Ok(content),
        Ok(Err(e)) => Err(e.to_string()),
        Err(e) => Err(e.to_string()),
    }
}
```

## 4. TypeScript/JavaScript 関連

### 型定義エラー

**問題: Tauri API の型が見つからない**

```typescript
Property 'invoke' does not exist on type 'Window'
```

**解決方法:**

```typescript
// @tauri-apps/api のインストール確認
npm install @tauri-apps/api

// 正しいインポート
import { invoke } from '@tauri-apps/api/core';

// 型定義ファイルが必要な場合
// src/types/tauri.d.ts
declare module '@tauri-apps/api/core' {
  export function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
}
```

### Promise 処理エラー

**問題: 未処理の Promise エラー**

```javascript
UnhandledPromiseRejectionWarning: Error: Command failed
```

**解決方法:**

```typescript
// 問題のあるコード
invoke("my_command"); // エラーハンドリングなし

// 修正されたコード
async function safeInvoke() {
    try {
        const result = await invoke("my_command");
        console.log(result);
    } catch (error) {
        console.error("Command failed:", error);
        // ユーザーへのエラー表示など
    }
}

// またはcatch チェーン
invoke("my_command")
    .then((result) => console.log(result))
    .catch((error) => console.error("Command failed:", error));
```

## 5. パフォーマンス問題

### メモリリーク

**問題: アプリケーションのメモリ使用量が増え続ける**

**解決方法:**

```typescript
// イベントリスナーの適切な削除
class ComponentManager {
    private listeners: (() => void)[] = [];

    addListener(
        element: HTMLElement,
        event: string,
        handler: EventListener
    ): void {
        element.addEventListener(event, handler);

        // クリーンアップ関数を保存
        this.listeners.push(() => {
            element.removeEventListener(event, handler);
        });
    }

    cleanup(): void {
        this.listeners.forEach((cleanup) => cleanup());
        this.listeners = [];
    }
}

// ページ離脱時のクリーンアップ
window.addEventListener("beforeunload", () => {
    componentManager.cleanup();
});
```

**Rust 側のメモリ管理:**

```rust
// 大きなデータを扱う際の注意
#[tauri::command]
async fn process_large_data() -> Result<String, String> {
    let large_data = load_large_data();
    let result = process_data(large_data);

    // 明示的なドロップは通常不要だが、必要に応じて
    drop(large_data);

    Ok(result)
}

// ストリーミング処理で大量データを扱う
#[tauri::command]
async fn stream_process_data() -> Result<Vec<String>, String> {
    let mut results = Vec::new();

    // チャンク単位で処理
    for chunk in data_chunks() {
        let processed = process_chunk(chunk);
        results.push(processed);

        // 必要に応じて途中でメモリを解放
        if results.len() % 1000 == 0 {
            // 中間結果をファイルに保存するなど
        }
    }

    Ok(results)
}
```

### フロントエンドパフォーマンス

**問題: 大量の DOM 要素でパフォーマンス低下**

**解決方法:**

```typescript
// Virtual Scrolling の実装
class VirtualScrollList {
    private container: HTMLElement;
    private itemHeight: number;
    private items: any[];
    private renderBuffer = 5; // 表示範囲外のアイテム数

    constructor(container: HTMLElement, itemHeight: number) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.setupScrollListener();
    }

    private setupScrollListener(): void {
        this.container.addEventListener(
            "scroll",
            this.throttle(this.onScroll.bind(this), 16) // 60fps
        );
    }

    private throttle(func: Function, delay: number): () => void {
        let timeoutId: number;
        let lastExecTime = 0;

        return () => {
            const currentTime = Date.now();

            if (currentTime - lastExecTime > delay) {
                func();
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func();
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    private onScroll(): void {
        this.renderVisibleItems();
    }

    private renderVisibleItems(): void {
        const scrollTop = this.container.scrollTop;
        const containerHeight = this.container.clientHeight;

        const startIndex = Math.max(
            0,
            Math.floor(scrollTop / this.itemHeight) - this.renderBuffer
        );
        const endIndex = Math.min(
            this.items.length - 1,
            Math.floor((scrollTop + containerHeight) / this.itemHeight) +
                this.renderBuffer
        );

        this.renderItems(startIndex, endIndex);
    }
}
```

## 6. デバッグのコツ

### ログ出力の活用

```rust
// Cargo.toml
[dependencies]
log = "0.4"
env_logger = "0.10"

// main.rs
fn main() {
    env_logger::init();

    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// コマンド内でのログ
use log::{debug, info, warn, error};

#[tauri::command]
async fn debug_command(input: String) -> Result<String, String> {
    debug!("debug_command called with: {}", input);

    if input.is_empty() {
        warn!("Empty input provided");
        return Err("Input cannot be empty".to_string());
    }

    info!("Processing input of length: {}", input.len());

    // 処理...

    info!("Command completed successfully");
    Ok("Success".to_string())
}
```

```typescript
// TypeScript側でのデバッグ
const DEBUG = import.meta.env.DEV;

function debugLog(message: string, data?: any): void {
    if (DEBUG) {
        console.log(`[DEBUG] ${message}`, data || "");
    }
}

async function debugInvoke<T>(cmd: string, args?: any): Promise<T> {
    debugLog(`Invoking command: ${cmd}`, args);

    try {
        const result = await invoke<T>(cmd, args);
        debugLog(`Command ${cmd} succeeded`, result);
        return result;
    } catch (error) {
        console.error(`Command ${cmd} failed:`, error);
        throw error;
    }
}
```

### ブレークポイントとデバッガー

```bash
# 開発ビルドでRustデバッグ情報を有効化
RUST_LOG=debug cargo tauri dev

# VSCodeでのデバッグ設定 (.vscode/launch.json)
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "lldb",
            "request": "launch",
            "name": "Tauri Development Debug",
            "cargo": {
                "args": [
                    "build",
                    "--manifest-path=./src-tauri/Cargo.toml",
                    "--no-default-features"
                ],
                "filter": {
                    "name": "app-name",
                    "kind": "bin"
                }
            },
            "args": [],
            "cwd": "${workspaceFolder}"
        }
    ]
}
```

## 7. プロダクション環境での問題

### ビルド最適化

```rust
// Cargo.toml でリリース最適化
[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"  # サイズ最適化

# または速度最適化
# opt-level = 3

[profile.dev]
debug = true
```

### コード署名の問題

```bash
# macOS でのコード署名確認
codesign -dv --verbose=4 /path/to/app.app

# 署名の修復
codesign --force --deep --sign "Developer ID Application: Your Name" /path/to/app.app
```

このトラブルシューティングガイドを参考に、問題の早期発見と解決を行ってください。
