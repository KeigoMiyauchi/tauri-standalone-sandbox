# 01. WPF 開発者のための Tauri 入門

## Tauri とは何か？

Tauri は WPF と同じく**デスクトップアプリケーション**を作るためのフレームワークです。しかし、アプローチが大きく異なります。

### WPF と Tauri の比較

| 項目               | WPF                     | Tauri                       |
| ------------------ | ----------------------- | --------------------------- |
| UI 技術            | XAML                    | HTML + CSS                  |
| プログラミング言語 | C#                      | TypeScript + Rust           |
| レンダリング       | .NET Framework/Core     | Web エンジン (WebView)      |
| 配布サイズ         | 大（.NET Runtime 必要） | 小（単一実行ファイル）      |
| パフォーマンス     | 高                      | 高（ネイティブ + Web 技術） |

### なぜ Tauri を選ぶのか？

1. **クロスプラットフォーム**: Windows、macOS、Linux で同じコードが動く
2. **軽量**: .NET Runtime が不要で配布サイズが小さい
3. **Web 技術の活用**: 豊富な Web UI ライブラリを使える
4. **セキュリティ**: サンドボックス化されたセキュアな実行環境

## Web 技術の基礎知識

WPF 開発者が知っておくべき Web 技術の最低限の知識を説明します。

### HTML: XAML に相当するマークアップ

**XAML（WPF）**

```xml
<Grid>
    <StackPanel>
        <TextBlock Text="Hello World" />
        <Button Content="Click Me" Click="Button_Click" />
    </StackPanel>
</Grid>
```

**HTML（Tauri）**

```html
<div class="container">
    <div class="stack">
        <h1>Hello World</h1>
        <button onclick="handleClick()">Click Me</button>
    </div>
</div>
```

### CSS: スタイルとレイアウト

WPF では Style や Template で見た目を定義しましたが、HTML では CSS を使います。

```css
.container {
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

button {
    background-color: #007acc;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}
```

### TypeScript: C#に似たプログラミング言語

TypeScript は JavaScript に型を追加した言語で、C#経験者には馴染みやすいです。

**C#（WPF）**

```csharp
public class MainViewModel : INotifyPropertyChanged
{
    private string _message = "Hello";
    public string Message
    {
        get => _message;
        set { _message = value; OnPropertyChanged(); }
    }
}
```

**TypeScript（Tauri）**

```typescript
class MainViewModel {
    private _message: string = "Hello";

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
        this.notifyChange();
    }
}
```

## Tauri のアーキテクチャ

Tauri アプリケーションは 2 つの部分で構成されます：

### フロントエンド（UI 層）

-   **技術**: HTML + CSS + TypeScript
-   **役割**: WPF の XAML とコードビハインドに相当
-   **実行環境**: WebView（ブラウザエンジン）

### バックエンド（ビジネスロジック層）

-   **技術**: Rust
-   **役割**: WPF の C#ビジネスロジックに相当
-   **実行環境**: ネイティブ（高速）

### 通信方法

WPF では同一プロセス内でメソッド呼び出しできましたが、Tauri では IPC（Inter-Process Communication）を使ってフロントエンドとバックエンドが通信します。

```typescript
// フロントエンド（TypeScript）
import { invoke } from "@tauri-apps/api/core";

async function saveFile(content: string) {
    await invoke("save_file", { content });
}
```

```rust
// バックエンド（Rust）
#[tauri::command]
fn save_file(content: String) -> Result<(), String> {
    // ファイル保存のロジック
    std::fs::write("output.txt", content)
        .map_err(|e| e.to_string())
}
```

## 学習の心構え

### WPF からの思考転換が必要な点

1. **宣言的 UI → 命令的 UI**: XAML の宣言的なデータバインディングから、より明示的な状態管理へ
2. **同期処理 → 非同期処理**: Web 技術では非同期処理（async/await）が基本
3. **強い型付け → 柔軟な型**: TypeScript は型安全ですが、JavaScript ベースなので柔軟性も高い

### 段階的な学習アプローチ

1. まず基本的な HTML/CSS/TypeScript を理解
2. 小さな Tauri アプリで基本パターンを習得
3. WPF で作ったアプリの機能を一つずつ Tauri で再実装

## 次のステップ

基本概念を理解したら、[02\_開発環境のセットアップ.md](./02_開発環境のセットアップ.md)で開発環境を整えましょう。
