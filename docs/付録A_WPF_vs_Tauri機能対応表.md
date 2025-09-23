# 付録 A: WPF vs Tauri 機能対応表

WPF の機能が Tauri でどのように実現できるかの対応表です。

## 1. UI 要素とレイアウト

| WPF            | Tauri (HTML/CSS)          | 実装例                                                 |
| -------------- | ------------------------- | ------------------------------------------------------ |
| **Grid**       | CSS Grid / Flexbox        | `display: grid; grid-template-columns: 1fr 2fr;`       |
| **StackPanel** | Flexbox                   | `display: flex; flex-direction: column;`               |
| **DockPanel**  | CSS Grid with named areas | `grid-template-areas: "header header" "sidebar main";` |
| **WrapPanel**  | Flexbox with wrap         | `display: flex; flex-wrap: wrap;`                      |
| **Canvas**     | Absolute positioning      | `position: absolute; top: 10px; left: 20px;`           |

### Grid Layout 例

```xml
<!-- WPF -->
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="*"/>
    </Grid.RowDefinitions>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="200"/>
        <ColumnDefinition Width="*"/>
    </Grid.ColumnDefinitions>
</Grid>
```

```html
<!-- Tauri -->
<div class="main-grid">
    <div class="header">ヘッダー</div>
    <div class="sidebar">サイドバー</div>
    <div class="content">コンテンツ</div>
</div>

<style>
    .main-grid {
        display: grid;
        grid-template-rows: auto 1fr;
        grid-template-columns: 200px 1fr;
        grid-template-areas:
            "header header"
            "sidebar content";
        height: 100vh;
    }
    .header {
        grid-area: header;
    }
    .sidebar {
        grid-area: sidebar;
    }
    .content {
        grid-area: content;
    }
</style>
```

## 2. コントロール対応

| WPF                | Tauri (HTML)              | 備考                 |
| ------------------ | ------------------------- | -------------------- |
| **Button**         | `<button>`                | 基本的なボタン       |
| **TextBox**        | `<input type="text">`     | 単行テキスト入力     |
| **TextBox (多行)** | `<textarea>`              | 複数行テキスト入力   |
| **Label**          | `<label>`                 | ラベル表示           |
| **ComboBox**       | `<select>`                | ドロップダウンリスト |
| **ListBox**        | `<select multiple>`       | 複数選択リスト       |
| **CheckBox**       | `<input type="checkbox">` | チェックボックス     |
| **RadioButton**    | `<input type="radio">`    | ラジオボタン         |
| **ProgressBar**    | `<progress>`              | プログレスバー       |
| **Slider**         | `<input type="range">`    | スライダー           |
| **DatePicker**     | `<input type="date">`     | 日付選択             |
| **TabControl**     | カスタム実装              | タブコントロール     |

### TabControl 実装例

```csharp
<!-- WPF -->
<TabControl>
    <TabItem Header="タブ1">
        <TextBlock Text="コンテンツ1"/>
    </TabItem>
    <TabItem Header="タブ2">
        <TextBlock Text="コンテンツ2"/>
    </TabItem>
</TabControl>
```

```html
<!-- Tauri -->
<div class="tab-control">
    <div class="tab-headers">
        <button class="tab-header active" data-tab="tab1">タブ1</button>
        <button class="tab-header" data-tab="tab2">タブ2</button>
    </div>
    <div class="tab-content">
        <div class="tab-panel active" id="tab1">コンテンツ1</div>
        <div class="tab-panel" id="tab2">コンテンツ2</div>
    </div>
</div>

<style>
    .tab-control {
        border: 1px solid #ccc;
    }
    .tab-headers {
        display: flex;
        background: #f5f5f5;
    }
    .tab-header {
        padding: 10px 20px;
        border: none;
        background: transparent;
        cursor: pointer;
    }
    .tab-header.active {
        background: white;
        border-bottom: 1px solid white;
    }
    .tab-panel {
        display: none;
        padding: 20px;
    }
    .tab-panel.active {
        display: block;
    }
</style>

<script>
    document.querySelectorAll(".tab-header").forEach((header) => {
        header.addEventListener("click", (e) => {
            const tabId = e.target.dataset.tab;

            // すべてのタブヘッダーとパネルからactiveクラスを削除
            document
                .querySelectorAll(".tab-header")
                .forEach((h) => h.classList.remove("active"));
            document
                .querySelectorAll(".tab-panel")
                .forEach((p) => p.classList.remove("active"));

            // 選択されたタブをアクティブに
            e.target.classList.add("active");
            document.getElementById(tabId).classList.add("active");
        });
    });
</script>
```

## 3. データバインディング対応

| WPF                        | Tauri              | 実装方法                                   |
| -------------------------- | ------------------ | ------------------------------------------ |
| **OneWay Binding**         | DOM 操作           | `element.textContent = data.value`         |
| **TwoWay Binding**         | イベントリスナー   | `input.addEventListener('input', handler)` |
| **INotifyPropertyChanged** | カスタム実装       | Observer パターン                          |
| **ObservableCollection**   | Proxy オブジェクト | `new Proxy(array, handler)`                |
| **Converter**              | 関数               | `formatCurrency(value)`                    |
| **Validation**             | カスタム実装       | バリデーション関数                         |

### データバインディング実装例

```csharp
// WPF - ViewModel
public class PersonViewModel : INotifyPropertyChanged
{
    private string _name;
    public string Name
    {
        get => _name;
        set { _name = value; OnPropertyChanged(); }
    }
}
```

```typescript
// Tauri - TypeScript
class PersonViewModel {
    private _name: string = "";
    private listeners: (() => void)[] = [];

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
        this.notifyChange();
    }

    subscribe(listener: () => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) this.listeners.splice(index, 1);
        };
    }

    private notifyChange(): void {
        this.listeners.forEach((listener) => listener());
    }
}

// 使用例
const person = new PersonViewModel();
const nameInput = document.getElementById("nameInput") as HTMLInputElement;
const nameDisplay = document.getElementById("nameDisplay");

// TwoWay Binding
nameInput.addEventListener("input", () => {
    person.name = nameInput.value;
});

person.subscribe(() => {
    nameInput.value = person.name;
    nameDisplay.textContent = person.name;
});
```

## 4. コマンド対応

| WPF                      | Tauri          | 実装方法           |
| ------------------------ | -------------- | ------------------ |
| **ICommand**             | カスタムクラス | Command パターン   |
| **RelayCommand**         | 関数ベース     | ラムダ式で実装     |
| **CanExecute**           | 状態管理       | enabled プロパティ |
| **ParameterizedCommand** | 引数付き関数   | パラメータ渡し     |

### Command 実装例

```csharp
// WPF
public ICommand SaveCommand { get; }

public MainViewModel()
{
    SaveCommand = new RelayCommand(Save, CanSave);
}

private bool CanSave() => !string.IsNullOrEmpty(Name);
private void Save() { /* 保存処理 */ }
```

```typescript
// Tauri
interface ICommand {
    execute(): Promise<void>;
    canExecute(): boolean;
    canExecuteChanged: (listener: () => void) => () => void;
}

class RelayCommand implements ICommand {
    private listeners: (() => void)[] = [];

    constructor(
        private executeFunc: () => Promise<void>,
        private canExecuteFunc: () => boolean = () => true
    ) {}

    async execute(): Promise<void> {
        if (this.canExecute()) {
            await this.executeFunc();
        }
    }

    canExecute(): boolean {
        return this.canExecuteFunc();
    }

    canExecuteChanged(listener: () => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) this.listeners.splice(index, 1);
        };
    }

    raiseCanExecuteChanged(): void {
        this.listeners.forEach((listener) => listener());
    }
}

// 使用例
class MainViewModel {
    saveCommand: ICommand;

    constructor() {
        this.saveCommand = new RelayCommand(
            () => this.save(),
            () => this.canSave()
        );
    }

    private async save(): Promise<void> {
        await invoke("save_data", { data: this.data });
    }

    private canSave(): boolean {
        return this.name.trim().length > 0;
    }
}
```

## 5. ファイル操作対応

| WPF                     | Tauri                       | 実装方法              |
| ----------------------- | --------------------------- | --------------------- |
| **OpenFileDialog**      | `@tauri-apps/plugin-dialog` | `open()` 関数         |
| **SaveFileDialog**      | `@tauri-apps/plugin-dialog` | `save()` 関数         |
| **FolderBrowserDialog** | `@tauri-apps/plugin-dialog` | `open()` で directory |
| **File.ReadAllText**    | `@tauri-apps/plugin-fs`     | `readTextFile()`      |
| **File.WriteAllText**   | `@tauri-apps/plugin-fs`     | `writeTextFile()`     |
| **Directory.GetFiles**  | `@tauri-apps/plugin-fs`     | `readDir()`           |

### ファイル操作実装例

```csharp
// WPF
var dialog = new OpenFileDialog
{
    Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*"
};

if (dialog.ShowDialog() == true)
{
    var content = File.ReadAllText(dialog.FileName);
    // ファイル内容を処理
}
```

```typescript
// Tauri
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";

async function openFile(): Promise<void> {
    try {
        const filePath = await open({
            filters: [
                { name: "Text Files", extensions: ["txt"] },
                { name: "All Files", extensions: ["*"] },
            ],
        });

        if (filePath) {
            const content = await readTextFile(filePath);
            // ファイル内容を処理
        }
    } catch (error) {
        console.error("ファイル読み込み失敗:", error);
    }
}
```

## 6. 設定・永続化対応

| WPF                     | Tauri            | 実装方法                 |
| ----------------------- | ---------------- | ------------------------ |
| **Properties.Settings** | カスタム実装     | JSON ファイル保存        |
| **ApplicationData**     | `app_data_dir()` | アプリデータディレクトリ |
| **Registry**            | OS 固有の実装    | プラットフォーム別処理   |
| **App.config**          | 設定ファイル     | JSON/TOML 設定           |

## 7. 通知・メッセージング対応

| WPF                   | Tauri                             | 実装方法             |
| --------------------- | --------------------------------- | -------------------- |
| **MessageBox**        | `@tauri-apps/plugin-dialog`       | `message()`, `ask()` |
| **NotifyIcon**        | `@tauri-apps/plugin-notification` | システム通知         |
| **Dispatcher.Invoke** | `setTimeout`/Promise              | 非同期処理           |
| **BackgroundWorker**  | Web Workers                       | バックグラウンド処理 |

## 8. ウィンドウ管理対応

| WPF                | Tauri                     | 実装方法             |
| ------------------ | ------------------------- | -------------------- |
| **Window.Show()**  | `new WebviewWindow()`     | 新しいウィンドウ作成 |
| **Window.Hide()**  | `window.hide()`           | ウィンドウを隠す     |
| **Window.Close()** | `window.close()`          | ウィンドウを閉じる   |
| **WindowState**    | `window.minimize()`       | ウィンドウ状態制御   |
| **Topmost**        | `window.setAlwaysOnTop()` | 最前面表示           |

## 9. スタイリング対応

| WPF           | CSS            | 実装方法                    |
| ------------- | -------------- | --------------------------- |
| **Style**     | CSS クラス     | `.button-style { ... }`     |
| **Template**  | HTML 構造      | カスタム HTML 要素          |
| **Trigger**   | CSS 疑似クラス | `:hover`, `:active`         |
| **Animation** | CSS Animation  | `@keyframes`, `transition`  |
| **Resources** | CSS 変数       | `--primary-color: #007acc;` |

### スタイリング例

```xml
<!-- WPF Style -->
<Style TargetType="Button">
    <Setter Property="Background" Value="Blue"/>
    <Setter Property="Foreground" Value="White"/>
    <Style.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter Property="Background" Value="LightBlue"/>
        </Trigger>
    </Style.Triggers>
</Style>
```

```css
/* Tauri CSS */
.custom-button {
    background-color: blue;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.custom-button:hover {
    background-color: lightblue;
}

.custom-button:active {
    transform: translateY(1px);
}
```

## 10. マルチスレッド対応

| WPF                   | Tauri           | 実装方法             |
| --------------------- | --------------- | -------------------- |
| **Task.Run()**        | Web Workers     | バックグラウンド処理 |
| **async/await**       | async/await     | 非同期処理           |
| **CancellationToken** | AbortController | 処理のキャンセル     |
| **Parallel.ForEach**  | Promise.all()   | 並列処理             |

## 11. データベース対応

| WPF (Entity Framework) | Tauri               | 実装方法         |
| ---------------------- | ------------------- | ---------------- |
| **DbContext**          | sqlx                | データベース接続 |
| **DbSet<T>**           | Repository パターン | データアクセス層 |
| **LINQ**               | SQL クエリ          | 直接 SQL 記述    |
| **Migration**          | sqlx migrate        | スキーマ管理     |

この対応表を参考に、既存の WPF アプリケーションを Tauri に移行する際の設計を検討してください。
