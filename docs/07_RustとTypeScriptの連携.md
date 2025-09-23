# 07. Rust と TypeScript の連携

WPF では同一プロセス内で C#のメソッドを直接呼び出していましたが、Tauri ではフロントエンドの TypeScript とバックエンドの Rust が IPC（Inter-Process Communication）で通信します。

## WPF と Tauri の通信方式比較

### WPF（参考）

```csharp
// ビジネスロジック
public class FileService
{
    public string ReadFile(string path)
    {
        return File.ReadAllText(path);
    }

    public void SaveFile(string path, string content)
    {
        File.WriteAllText(path, content);
    }
}

// UIから直接呼び出し
private void LoadButton_Click(object sender, RoutedEventArgs e)
{
    var service = new FileService();
    var content = service.ReadFile("data.txt");
    ContentTextBox.Text = content;
}
```

### Tauri（IPC 通信）

```typescript
// TypeScript側（フロントエンド）
import { invoke } from "@tauri-apps/api/core";

async function loadFile() {
    try {
        const content = await invoke<string>("read_file", {
            path: "data.txt",
        });
        document.getElementById("content")!.textContent = content;
    } catch (error) {
        console.error("ファイル読み込みエラー:", error);
    }
}
```

```rust
// Rust側（バックエンド）
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path)
        .map_err(|e| e.to_string())
}
```

## 基本的なコマンドの実装

### 1. 簡単な文字列処理

**Rust 側（src-tauri/src/main.rs）**

```rust
#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {}! Greetings from Rust!", name)
}

#[tauri::command]
fn calculate_sum(a: i32, b: i32) -> i32 {
    a + b
}

#[tauri::command]
fn reverse_string(input: String) -> String {
    input.chars().rev().collect()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            calculate_sum,
            reverse_string
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**TypeScript 側（src/main.ts）**

```typescript
import { invoke } from "@tauri-apps/api/core";

// 挨拶機能
async function greetUser() {
    const nameInput = document.getElementById("name") as HTMLInputElement;
    const result = await invoke<string>("greet", {
        name: nameInput.value,
    });

    document.getElementById("greeting")!.textContent = result;
}

// 計算機能
async function calculateSum() {
    const aInput = document.getElementById("num-a") as HTMLInputElement;
    const bInput = document.getElementById("num-b") as HTMLInputElement;

    const result = await invoke<number>("calculate_sum", {
        a: parseInt(aInput.value),
        b: parseInt(bInput.value),
    });

    document.getElementById("result")!.textContent = result.toString();
}

// 文字列反転機能
async function reverseText() {
    const textInput = document.getElementById("text") as HTMLInputElement;
    const result = await invoke<string>("reverse_string", {
        input: textInput.value,
    });

    document.getElementById("reversed")!.textContent = result;
}

// イベントハンドラーの設定
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("greet-btn")?.addEventListener("click", greetUser);
    document
        .getElementById("calc-btn")
        ?.addEventListener("click", calculateSum);
    document
        .getElementById("reverse-btn")
        ?.addEventListener("click", reverseText);
});
```

### 2. 構造体を使った複雑なデータ

**Rust 側**

```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Person {
    name: String,
    age: u32,
    email: String,
}

#[derive(Serialize, Deserialize)]
struct PersonSummary {
    full_name: String,
    age_group: String,
    is_adult: bool,
}

#[tauri::command]
fn process_person(person: Person) -> PersonSummary {
    let age_group = match person.age {
        0..=12 => "子供",
        13..=19 => "青少年",
        20..=64 => "成人",
        _ => "高齢者",
    }.to_string();

    PersonSummary {
        full_name: format!("{}さん", person.name),
        age_group,
        is_adult: person.age >= 20,
    }
}

// main関数のinvoke_handlerに追加
// .invoke_handler(tauri::generate_handler![process_person])
```

**TypeScript 側**

```typescript
interface Person {
    name: string;
    age: number;
    email: string;
}

interface PersonSummary {
    full_name: string;
    age_group: string;
    is_adult: boolean;
}

async function processPerson() {
    const person: Person = {
        name: (document.getElementById("person-name") as HTMLInputElement)
            .value,
        age: parseInt(
            (document.getElementById("person-age") as HTMLInputElement).value
        ),
        email: (document.getElementById("person-email") as HTMLInputElement)
            .value,
    };

    try {
        const summary = await invoke<PersonSummary>("process_person", {
            person,
        });

        document.getElementById("summary-name")!.textContent =
            summary.full_name;
        document.getElementById("summary-age-group")!.textContent =
            summary.age_group;
        document.getElementById("summary-adult")!.textContent = summary.is_adult
            ? "はい"
            : "いいえ";
    } catch (error) {
        console.error("処理エラー:", error);
    }
}
```

## ファイル操作の実装

WPF でよく使うファイル操作を Tauri で実装してみましょう。

**Rust 側**

```rust
use std::fs;
use std::path::Path;

#[tauri::command]
async fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("ファイル読み込みエラー: {}", e))
}

#[tauri::command]
async fn write_text_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content)
        .map_err(|e| format!("ファイル書き込みエラー: {}", e))
}

#[tauri::command]
async fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
async fn get_file_size(path: String) -> Result<u64, String> {
    fs::metadata(&path)
        .map(|m| m.len())
        .map_err(|e| format!("ファイル情報取得エラー: {}", e))
}

#[derive(Serialize)]
struct FileInfo {
    name: String,
    size: u64,
    is_file: bool,
    modified: String,
}

#[tauri::command]
async fn list_directory(path: String) -> Result<Vec<FileInfo>, String> {
    let dir = fs::read_dir(&path)
        .map_err(|e| format!("ディレクトリ読み込みエラー: {}", e))?;

    let mut files = Vec::new();

    for entry in dir {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;

        let modified = metadata.modified()
            .map(|time| format!("{:?}", time))
            .unwrap_or_else(|_| "不明".to_string());

        files.push(FileInfo {
            name: entry.file_name().to_string_lossy().to_string(),
            size: metadata.len(),
            is_file: metadata.is_file(),
            modified,
        });
    }

    Ok(files)
}
```

**TypeScript 側**

```typescript
interface FileInfo {
    name: string;
    size: number;
    is_file: boolean;
    modified: string;
}

class FileManager {
    private currentPath: string = "";

    async loadFile(path: string): Promise<string> {
        try {
            return await invoke<string>("read_text_file", { path });
        } catch (error) {
            throw new Error(`ファイル読み込み失敗: ${error}`);
        }
    }

    async saveFile(path: string, content: string): Promise<void> {
        try {
            await invoke("write_text_file", { path, content });
        } catch (error) {
            throw new Error(`ファイル保存失敗: ${error}`);
        }
    }

    async checkFileExists(path: string): Promise<boolean> {
        return await invoke<boolean>("file_exists", { path });
    }

    async getFileSize(path: string): Promise<number> {
        try {
            return await invoke<number>("get_file_size", { path });
        } catch (error) {
            throw new Error(`ファイルサイズ取得失敗: ${error}`);
        }
    }

    async listDirectory(path: string): Promise<FileInfo[]> {
        try {
            return await invoke<FileInfo[]>("list_directory", { path });
        } catch (error) {
            throw new Error(`ディレクトリ一覧取得失敗: ${error}`);
        }
    }
}

// 使用例
const fileManager = new FileManager();

async function loadTextFile() {
    const pathInput = document.getElementById("file-path") as HTMLInputElement;
    const contentArea = document.getElementById(
        "file-content"
    ) as HTMLTextAreaElement;

    try {
        const content = await fileManager.loadFile(pathInput.value);
        contentArea.value = content;

        // ファイルサイズも表示
        const size = await fileManager.getFileSize(pathInput.value);
        document.getElementById("file-size")!.textContent = `${size} bytes`;
    } catch (error) {
        alert(error);
    }
}

async function saveTextFile() {
    const pathInput = document.getElementById("file-path") as HTMLInputElement;
    const contentArea = document.getElementById(
        "file-content"
    ) as HTMLTextAreaElement;

    try {
        await fileManager.saveFile(pathInput.value, contentArea.value);
        alert("ファイルを保存しました");
    } catch (error) {
        alert(error);
    }
}
```

## エラーハンドリング

WPF の try-catch に相当するエラーハンドリングを実装します。

**Rust 側（カスタムエラー型）**

```rust
use serde::Serialize;

#[derive(Serialize)]
struct AppError {
    code: String,
    message: String,
}

impl From<std::io::Error> for AppError {
    fn from(error: std::io::Error) -> Self {
        AppError {
            code: "IO_ERROR".to_string(),
            message: error.to_string(),
        }
    }
}

#[tauri::command]
async fn safe_file_operation(path: String) -> Result<String, AppError> {
    // ファイルの存在チェック
    if !Path::new(&path).exists() {
        return Err(AppError {
            code: "FILE_NOT_FOUND".to_string(),
            message: format!("ファイルが見つかりません: {}", path),
        });
    }

    // ファイル読み込み
    let content = fs::read_to_string(&path)?;

    // 内容のバリデーション
    if content.is_empty() {
        return Err(AppError {
            code: "EMPTY_FILE".to_string(),
            message: "ファイルが空です".to_string(),
        });
    }

    Ok(content)
}
```

**TypeScript 側（エラーハンドリング）**

```typescript
interface AppError {
    code: string;
    message: string;
}

class SafeFileManager {
    async safeLoadFile(
        path: string
    ): Promise<{ success: boolean; data?: string; error?: AppError }> {
        try {
            const content = await invoke<string>("safe_file_operation", {
                path,
            });
            return { success: true, data: content };
        } catch (error) {
            // Tauriはエラーを文字列として返すことがある
            let appError: AppError;

            if (typeof error === "string") {
                try {
                    appError = JSON.parse(error);
                } catch {
                    appError = { code: "UNKNOWN", message: error };
                }
            } else {
                appError = error as AppError;
            }

            return { success: false, error: appError };
        }
    }

    async loadFileWithErrorHandling(path: string) {
        const result = await this.safeLoadFile(path);

        if (result.success) {
            // 成功時の処理
            document.getElementById("file-content")!.textContent = result.data!;
            this.showMessage("ファイルを読み込みました", "success");
        } else {
            // エラー時の処理
            const error = result.error!;

            switch (error.code) {
                case "FILE_NOT_FOUND":
                    this.showMessage("ファイルが見つかりません", "error");
                    break;
                case "EMPTY_FILE":
                    this.showMessage("ファイルが空です", "warning");
                    break;
                case "IO_ERROR":
                    this.showMessage(
                        "ファイル読み込み中にエラーが発生しました",
                        "error"
                    );
                    break;
                default:
                    this.showMessage(
                        `予期しないエラー: ${error.message}`,
                        "error"
                    );
            }
        }
    }

    private showMessage(text: string, type: "success" | "error" | "warning") {
        const messageEl = document.getElementById("message") as HTMLDivElement;
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = "block";

        // 3秒後に非表示
        setTimeout(() => {
            messageEl.style.display = "none";
        }, 3000);
    }
}
```

## 非同期処理の管理

Rust の非同期処理を TypeScript で適切に扱う方法です。

**Rust 側**

```rust
use tokio::time::{sleep, Duration};

#[tauri::command]
async fn long_running_task(seconds: u64) -> Result<String, String> {
    // 重い処理のシミュレーション
    for i in 1..=seconds {
        sleep(Duration::from_secs(1)).await;
        println!("進行状況: {}/{}", i, seconds);
    }

    Ok(format!("{}秒の処理が完了しました", seconds))
}

#[tauri::command]
async fn parallel_tasks() -> Result<Vec<String>, String> {
    // 複数のタスクを並行実行
    let task1 = async { "タスク1完了".to_string() };
    let task2 = async {
        sleep(Duration::from_secs(2)).await;
        "タスク2完了".to_string()
    };
    let task3 = async { "タスク3完了".to_string() };

    let results = tokio::join!(task1, task2, task3);
    Ok(vec![results.0, results.1, results.2])
}
```

**TypeScript 側**

```typescript
class TaskManager {
    private isRunning = false;

    async runLongTask(seconds: number) {
        if (this.isRunning) {
            alert("既にタスクが実行中です");
            return;
        }

        this.isRunning = true;
        this.updateUI(true);

        try {
            const result = await invoke<string>("long_running_task", {
                seconds,
            });
            this.showResult(result);
        } catch (error) {
            this.showError(`エラー: ${error}`);
        } finally {
            this.isRunning = false;
            this.updateUI(false);
        }
    }

    async runParallelTasks() {
        this.updateUI(true);

        try {
            const results = await invoke<string[]>("parallel_tasks");
            this.showResults(results);
        } catch (error) {
            this.showError(`エラー: ${error}`);
        } finally {
            this.updateUI(false);
        }
    }

    private updateUI(isRunning: boolean) {
        const button = document.getElementById("run-task") as HTMLButtonElement;
        const loading = document.getElementById("loading") as HTMLDivElement;

        button.disabled = isRunning;
        button.textContent = isRunning ? "実行中..." : "タスク実行";
        loading.style.display = isRunning ? "block" : "none";
    }

    private showResult(result: string) {
        document.getElementById("result")!.textContent = result;
    }

    private showResults(results: string[]) {
        const resultList = document.getElementById(
            "result-list"
        ) as HTMLUListElement;
        resultList.innerHTML = "";

        results.forEach((result) => {
            const li = document.createElement("li");
            li.textContent = result;
            resultList.appendChild(li);
        });
    }

    private showError(error: string) {
        document.getElementById("error")!.textContent = error;
    }
}
```

## 次のステップ

Rust と TypeScript の連携方法を理解したら、[08\_よく使う機能の実装例.md](./08_よく使う機能の実装例.md) で実際のアプリケーションでよく使われる機能の実装方法を学習しましょう。
