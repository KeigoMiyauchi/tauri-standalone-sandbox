# 05. HTML による UI 作成の基礎

WPF の XAML で UI を作成していたように、Tauri では HTML と CSS で UI を作成します。このセクションでは、XAML の知識を HTML に移行する方法を学習します。

## XAML と HTML の基本的な違い

### 構造の考え方

-   **XAML**: コントロール中心（Button、TextBox、Grid など）
-   **HTML**: 文書構造中心（見出し、段落、リスト、フォーム など）

### スタイルの適用方法

-   **XAML**: プロパティ直接指定 または Style リソース
-   **HTML**: CSS によるスタイル指定

## 基本的な UI 要素の対応表

| WPF (XAML)     | HTML                         | 説明                   |
| -------------- | ---------------------------- | ---------------------- |
| `<TextBlock>`  | `<p>`, `<span>`, `<h1>~<h6>` | テキスト表示           |
| `<Button>`     | `<button>`                   | ボタン                 |
| `<TextBox>`    | `<input type="text">`        | テキスト入力           |
| `<CheckBox>`   | `<input type="checkbox">`    | チェックボックス       |
| `<ComboBox>`   | `<select>`                   | ドロップダウン         |
| `<ListBox>`    | `<ul>`, `<ol>`               | リスト                 |
| `<Grid>`       | `<div>` + CSS Grid           | グリッドレイアウト     |
| `<StackPanel>` | `<div>` + CSS Flexbox        | スタック（縦・横並び） |

## 実践例: ログインフォームの作成

### WPF 版（参考）

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="Auto"/>
    </Grid.RowDefinitions>

    <TextBlock Grid.Row="0" Text="ユーザー名:" Margin="5"/>
    <TextBox Grid.Row="1" x:Name="UsernameTextBox" Margin="5"/>

    <TextBlock Grid.Row="2" Text="パスワード:" Margin="5"/>
    <PasswordBox Grid.Row="3" x:Name="PasswordBox" Margin="5"/>

    <Button Grid.Row="4" Content="ログイン" Click="LoginButton_Click" Margin="5"/>
</Grid>
```

### HTML + CSS 版

**index.html**

```html
<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ログインアプリ</title>
        <link rel="stylesheet" href="src/style.css" />
    </head>
    <body>
        <div class="container">
            <div class="login-form">
                <h1>ログイン</h1>

                <form id="login-form">
                    <div class="form-group">
                        <label for="username">ユーザー名:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">パスワード:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                        />
                    </div>

                    <button type="submit" class="login-button">ログイン</button>
                </form>

                <div id="message" class="message"></div>
            </div>
        </div>

        <script type="module" src="src/main.ts"></script>
    </body>
</html>
```

**src/style.css**

```css
/* 全体のスタイル */
body {
    margin: 0;
    padding: 0;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f0f0f0;
}

/* コンテナ（WPFのGridに相当） */
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}

/* ログインフォーム */
.login-form {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

/* 見出し */
h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
}

/* フォームグループ（WPFの行に相当） */
.form-group {
    margin-bottom: 20px;
}

/* ラベル（WPFのTextBlockに相当） */
label {
    display: block;
    margin-bottom: 5px;
    color: #555;
    font-weight: 500;
}

/* 入力フィールド（WPFのTextBox、PasswordBoxに相当） */
input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
}

input[type="text"]:focus,
input[type="password"]:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 5px rgba(0, 122, 204, 0.3);
}

/* ボタン（WPFのButtonに相当） */
.login-button {
    width: 100%;
    padding: 12px;
    background-color: #007acc;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
}

.login-button:hover {
    background-color: #005a9e;
}

.login-button:active {
    background-color: #004578;
}

/* メッセージ表示 */
.message {
    margin-top: 20px;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
    display: none;
}

.message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
    display: block;
}

.message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    display: block;
}
```

## レイアウトシステムの理解

### CSS Flexbox（WPF の StackPanel に相当）

要素を縦または横に並べるレイアウトです。

```css
/* 縦に並べる（StackPanel Orientation="Vertical"） */
.vertical-stack {
    display: flex;
    flex-direction: column;
    gap: 10px; /* 要素間の間隔 */
}

/* 横に並べる（StackPanel Orientation="Horizontal"） */
.horizontal-stack {
    display: flex;
    flex-direction: row;
    gap: 10px;
}
```

```html
<div class="vertical-stack">
    <button>ボタン1</button>
    <button>ボタン2</button>
    <button>ボタン3</button>
</div>
```

### CSS Grid（WPF の Grid に相当）

行と列を使った複雑なレイアウトです。

```css
.grid-layout {
    display: grid;
    grid-template-columns: 1fr 2fr; /* 列の幅比率 */
    grid-template-rows: auto auto auto; /* 行の高さ */
    gap: 10px; /* セル間の間隔 */
}

.grid-item {
    padding: 10px;
    background-color: #f0f0f0;
}
```

```html
<div class="grid-layout">
    <div class="grid-item">セル1</div>
    <div class="grid-item">セル2</div>
    <div class="grid-item">セル3</div>
    <div class="grid-item">セル4</div>
</div>
```

## 実用的なレイアウトパターン

### 1. アプリケーションヘッダー + コンテンツ

```html
<div class="app-layout">
    <header class="app-header">
        <h1>アプリケーション名</h1>
        <nav>
            <button>ファイル</button>
            <button>編集</button>
            <button>表示</button>
        </nav>
    </header>

    <main class="app-content">
        <!-- メインコンテンツ -->
    </main>
</div>
```

```css
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.app-header {
    background-color: #2d3748;
    color: white;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.app-content {
    flex: 1; /* 残りの高さを全て使用 */
    padding: 20px;
    overflow-y: auto; /* 内容が多い場合はスクロール */
}
```

### 2. サイドバー + メインエリア

```html
<div class="app-layout">
    <aside class="sidebar">
        <nav>
            <ul>
                <li><a href="#home">ホーム</a></li>
                <li><a href="#settings">設定</a></li>
                <li><a href="#about">について</a></li>
            </ul>
        </nav>
    </aside>

    <main class="main-content">
        <!-- メインコンテンツ -->
    </main>
</div>
```

```css
.app-layout {
    display: flex;
    height: 100vh;
}

.sidebar {
    width: 250px;
    background-color: #f8f9fa;
    border-right: 1px solid #dee2e6;
    padding: 20px;
}

.main-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}
```

## 実習: 簡単な計算機 UI

WPF で作ったことがあるような計算機 UI を HTML で作成してみましょう。

```html
<div class="calculator">
    <div class="display">
        <input type="text" id="display" readonly />
    </div>

    <div class="buttons">
        <button class="btn clear">C</button>
        <button class="btn">±</button>
        <button class="btn">%</button>
        <button class="btn operator">÷</button>

        <button class="btn number">7</button>
        <button class="btn number">8</button>
        <button class="btn number">9</button>
        <button class="btn operator">×</button>

        <button class="btn number">4</button>
        <button class="btn number">5</button>
        <button class="btn number">6</button>
        <button class="btn operator">-</button>

        <button class="btn number">1</button>
        <button class="btn number">2</button>
        <button class="btn number">3</button>
        <button class="btn operator">+</button>

        <button class="btn number zero">0</button>
        <button class="btn number">.</button>
        <button class="btn operator equal">=</button>
    </div>
</div>
```

```css
.calculator {
    width: 300px;
    background-color: #333;
    border-radius: 10px;
    padding: 20px;
    margin: 20px auto;
}

.display input {
    width: 100%;
    height: 60px;
    font-size: 24px;
    text-align: right;
    padding: 0 15px;
    border: none;
    border-radius: 5px;
    background-color: #000;
    color: white;
}

.buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 20px;
}

.btn {
    height: 60px;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn.number {
    background-color: #666;
    color: white;
}

.btn.operator {
    background-color: #ff9500;
    color: white;
}

.btn.clear {
    background-color: #a6a6a6;
    color: black;
}

.btn.zero {
    grid-column: span 2; /* 2列分の幅 */
}

.btn:hover {
    opacity: 0.8;
}

.btn:active {
    transform: scale(0.95);
}
```

## 次のステップ

HTML と CSS で UI を作成する基本を理解したら、[06_TypeScript とデータバインディング.md](./06_TypeScriptとデータバインディング.md) で WPF のデータバインディングに相当する仕組みを学習しましょう。
