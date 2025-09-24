// Tauriアプリケーション用JavaScript（完全スタンドアロン版）

// キーボードショートカットでリロード機能を追加
document.addEventListener("keydown", (e) => {
    // Cmd+R (macOS) または Ctrl+R (Windows/Linux) でリロード
    if ((e.metaKey || e.ctrlKey) && e.key === "r") {
        e.preventDefault();

        location.reload();
    }

    // F5キーでもリロード
    if (e.key === "F5") {
        e.preventDefault();

        location.reload();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    // リロードボタンの設定
    const reloadBtn = document.getElementById("reload-btn");
    if (reloadBtn) {
        reloadBtn.addEventListener("click", () => {
            location.reload();
        });
    }

    const demoList = document.getElementById("demo-list");
    const demoDisplay = document.getElementById("demo-display");

    if (demoList) {
        // シンプルなデモ一覧を作成
        demoList.innerHTML = `
      <li class="demo-item">
        <button data-demo-id="hello-world">
          <span class="demo-title">Hello World デモ</span>
          <span class="demo-description">ボタンをクリックしてHello Worldメッセージを表示するシンプルなデモ</span>
        </button>
      </li>
      <li class="demo-item">
        <button data-demo-id="image-viewer">
          <span class="demo-title">画像ビューア</span>
          <span class="demo-description">ファイル選択ダイアログで画像を選択し、表示するデモ</span>
        </button>
      </li>
      <li class="demo-item">
        <button data-demo-id="system-info">
          <span class="demo-title">システム情報</span>
          <span class="demo-description">OS、CPU、メモリ、ディスクなどのシステム情報を表示するデモ</span>
        </button>
      </li>
      <li class="demo-item">
        <button data-demo-id="file-explorer">
          <span class="demo-title">ファイルエクスプローラー</span>
          <span class="demo-description">ディレクトリの内容を表示し、ファイルやフォルダを閲覧するデモ</span>
        </button>
      </li>
      <li class="demo-item">
        <button data-demo-id="database-memo">
          <span class="demo-title">💾 ローカルデータベースデモ</span>
          <span class="demo-description">SQLiteを使ったメモアプリ - CRUD操作とデータの永続化</span>
        </button>
      </li>
    `;

        // クリックイベントを追加
        demoList.addEventListener("click", (e) => {
            const button = e.target.closest("button[data-demo-id]");
            if (button && demoDisplay) {
                const demoId = button.dataset.demoId;
                if (demoId === "hello-world") {
                    showHelloWorldDemo();
                } else if (demoId === "image-viewer") {
                    showImageViewerDemo();
                } else if (demoId === "system-info") {
                    showSystemInfoDemo();
                } else if (demoId === "file-explorer") {
                    showFileExplorerDemo();
                } else if (demoId === "database-memo") {
                    showDatabaseMemoDemo();
                }
            }
        });
    }
});

// 共通のユーティリティ関数
function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Hello World デモを表示
function showHelloWorldDemo() {
    const demoDisplay = document.getElementById("demo-display");

    demoDisplay.innerHTML = `
    <div class="demo-container hello-world-demo">
      <div class="demo-header">
        <h2>Hello World デモ</h2>
        <p>Tauriアプリケーションの基本的なフロントエンド・バックエンド連携デモです。</p>
      </div>
      <div class="card">
        <div class="form-group">
          <label for="name-input">あなたの名前を入力してください:</label>
          <input type="text" id="name-input" class="form-control" placeholder="名前を入力..." value="Tauri">
        </div>
        <button id="greet-btn" class="btn">挨拶する</button>
      </div>
      <div class="greeting-display">
        <div id="greeting-message" class="greeting-placeholder">
          ボタンをクリックして挨拶を表示...
        </div>
      </div>
    </div>
  `;

    // Hello Worldデモの機能を設定
    setTimeout(() => {
        const button = document.getElementById("greet-btn");
        const input = document.getElementById("name-input");
        const message = document.getElementById("greeting-message");

        if (button && input && message) {
            button.addEventListener("click", async () => {
                try {
                    const name = input.value || "Anonymous";
                    const greeting = await window.__TAURI__.core.invoke(
                        "greet",
                        { name }
                    );
                    message.textContent = greeting;
                    message.className = "greeting-message";
                } catch (error) {
                    message.textContent = "エラーが発生しました: " + error;
                    message.className = "greeting-message";
                }
            });
        }
    }, 0);
}

// 画像ビューア デモを表示
function showImageViewerDemo() {
    const demoDisplay = document.getElementById("demo-display");

    demoDisplay.innerHTML = `
    <div class="demo-container image-viewer">
      <div class="demo-header">
        <h2>画像ビューア デモ</h2>
        <p>ローカルファイルから画像を選択して表示します。</p>
      </div>
      <div class="card">
        <button id="select-image-btn" class="btn">画像を選択</button>
      </div>
      <div id="image-display" class="image-display">
        <div class="image-placeholder">
          画像を選択してください
        </div>
      </div>
    </div>
  `;

    // 画像ビューアデモの機能を設定
    setTimeout(() => {
        const button = document.getElementById("select-image-btn");
        const display = document.getElementById("image-display");

        if (button && display) {
            button.addEventListener("click", async () => {
                try {
                    button.textContent = "選択中...";
                    button.disabled = true;

                    // Tauri invoke APIを使用してカスタムコマンドでファイル選択
                    const selected = await window.__TAURI__.core.invoke(
                        "select_image_file"
                    );

                    if (selected) {
                        try {
                            const imageData =
                                await window.__TAURI__.core.invoke(
                                    "read_image_file",
                                    { filePath: selected }
                                );
                            const fileInfo = await window.__TAURI__.core.invoke(
                                "get_file_info",
                                { filePath: selected }
                            );

                            // ファイル拡張子から MIME type を推定
                            const getImageMimeType = (filePath) => {
                                const extension = filePath
                                    .split(".")
                                    .pop()
                                    .toLowerCase();
                                switch (extension) {
                                    case "jpg":
                                    case "jpeg":
                                        return "jpeg";
                                    case "png":
                                        return "png";
                                    case "gif":
                                        return "gif";
                                    case "webp":
                                        return "webp";
                                    default:
                                        return "jpeg";
                                }
                            };

                            display.innerHTML = `
                <img src="data:image/${getImageMimeType(
                    selected
                )};base64,${imageData}" alt="選択された画像" />
                <div class="image-info">
                  <h4>ファイル情報</h4>
                  <p>ファイル名: ${fileInfo.name}</p>
                  <p>サイズ: ${(fileInfo.size / 1024).toFixed(2)} KB</p>
                  <p>パス: ${selected}</p>
                </div>
              `;
                            display.classList.add("has-image");
                        } catch (error) {
                            console.error("画像読み込みエラー:", error);
                            display.innerHTML = `<div class="image-placeholder">画像の読み込みエラー: ${error}</div>`;
                        }
                    }
                } catch (error) {
                    console.error("ファイル選択エラー:", error);
                    display.innerHTML = `<div class="image-placeholder">ファイル選択エラー: ${error}</div>`;
                } finally {
                    button.textContent = "画像を選択";
                    button.disabled = false;
                }
            });
        }
    }, 0);
}

// システム情報デモを表示
function showSystemInfoDemo() {
    const demoDisplay = document.getElementById("demo-display");

    demoDisplay.innerHTML = `
    <div class="demo-container system-info">
      <div class="demo-header">
        <h2>システム情報デモ</h2>
        <p>現在のシステムの詳細情報を表示します。</p>
      </div>
      
      <div class="card">
        <button id="refresh-info-btn" class="btn">情報を更新</button>
      </div>
      
      <div id="system-info-display" class="system-info-display">
        <div class="info-placeholder">
          「情報を更新」ボタンをクリックしてシステム情報を表示してください
        </div>
      </div>
      
      <div class="card">
        <h3>このデモについて</h3>
        <p>このデモでは以下の情報を表示します：</p>
        <ul>
          <li>OS情報（名前、バージョン、カーネル）</li>
          <li>ホスト名</li>
          <li>CPU情報（ブランド、コア数）</li>
          <li>メモリ使用状況</li>
          <li>ディスク使用状況</li>
          <li>システム稼働時間</li>
        </ul>
      </div>
    </div>
  `;

    // システム情報デモの機能を設定
    setTimeout(() => {
        const refreshBtn = document.getElementById("refresh-info-btn");
        const infoDisplay = document.getElementById("system-info-display");

        if (refreshBtn && infoDisplay) {
            const loadSystemInfo = async () => {
                try {
                    refreshBtn.textContent = "読み込み中...";
                    refreshBtn.disabled = true;

                    const systemInfo = await window.__TAURI__.core.invoke(
                        "get_system_info"
                    );

                    const formatBytes = (bytes) => {
                        if (bytes === 0) return "0 B";
                        const k = 1024;
                        const sizes = ["B", "KB", "MB", "GB", "TB"];
                        const i = Math.floor(Math.log(bytes) / Math.log(k));
                        return (
                            parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
                            " " +
                            sizes[i]
                        );
                    };

                    const formatUptime = (seconds) => {
                        const days = Math.floor(seconds / 86400);
                        const hours = Math.floor((seconds % 86400) / 3600);
                        const minutes = Math.floor((seconds % 3600) / 60);
                        return `${days}日 ${hours}時間 ${minutes}分`;
                    };

                    const diskInfo = systemInfo.disks
                        .map(
                            (disk) => `
                        <div class="disk-item">
                            <h4>${disk.name} (${disk.mount_point})</h4>
                            <div class="disk-usage">
                                <div class="usage-bar">
                                    <div class="usage-fill" style="width: ${
                                        disk.usage_percent
                                    }%"></div>
                                </div>
                                <span>${disk.usage_percent.toFixed(
                                    1
                                )}% 使用中</span>
                            </div>
                            <p>
                                ${formatBytes(disk.used_space)} / ${formatBytes(
                                disk.total_space
                            )} 
                                (空き: ${formatBytes(disk.available_space)})
                            </p>
                            <p>ファイルシステム: ${disk.file_system}</p>
                        </div>
                    `
                        )
                        .join("");

                    infoDisplay.innerHTML = `
                        <div class="system-info-grid">
                            <div class="info-section">
                                <h3>🖥️ システム情報</h3>
                                <div class="info-item">
                                    <strong>OS:</strong> ${
                                        systemInfo.os_name
                                    } ${systemInfo.os_version}
                                </div>
                                <div class="info-item">
                                    <strong>カーネル:</strong> ${
                                        systemInfo.kernel_version
                                    }
                                </div>
                                <div class="info-item">
                                    <strong>ホスト名:</strong> ${
                                        systemInfo.hostname
                                    }
                                </div>
                                <div class="info-item">
                                    <strong>稼働時間:</strong> ${formatUptime(
                                        systemInfo.uptime
                                    )}
                                </div>
                            </div>
                            
                            <div class="info-section">
                                <h3>⚡ CPU情報</h3>
                                <div class="info-item">
                                    <strong>CPU:</strong> ${
                                        systemInfo.cpu_brand
                                    }
                                </div>
                                <div class="info-item">
                                    <strong>コア数:</strong> ${
                                        systemInfo.cpu_cores
                                    }
                                </div>
                            </div>
                            
                            <div class="info-section">
                                <h3>🧠 メモリ情報</h3>
                                <div class="memory-usage">
                                    <div class="usage-bar">
                                        <div class="usage-fill" style="width: ${
                                            systemInfo.memory_usage_percent
                                        }%"></div>
                                    </div>
                                    <span>${systemInfo.memory_usage_percent.toFixed(
                                        1
                                    )}% 使用中</span>
                                </div>
                                <div class="info-item">
                                    <strong>使用中:</strong> ${formatBytes(
                                        systemInfo.used_memory
                                    )}
                                </div>
                                <div class="info-item">
                                    <strong>合計:</strong> ${formatBytes(
                                        systemInfo.total_memory
                                    )}
                                </div>
                                <div class="info-item">
                                    <strong>利用可能:</strong> ${formatBytes(
                                        systemInfo.available_memory
                                    )}
                                </div>
                            </div>
                            
                            <div class="info-section full-width">
                                <h3>💾 ディスク情報</h3>
                                <div class="disks-container">
                                    ${diskInfo}
                                </div>
                            </div>
                        </div>
                    `;
                } catch (error) {
                    console.error("システム情報取得エラー:", error);
                    infoDisplay.innerHTML = `<div class="info-placeholder error">システム情報の取得に失敗しました: ${error}</div>`;
                } finally {
                    refreshBtn.textContent = "情報を更新";
                    refreshBtn.disabled = false;
                }
            };

            refreshBtn.addEventListener("click", loadSystemInfo);

            // 初回自動読み込み
            loadSystemInfo();
        }
    }, 0);
}

// ファイルエクスプローラーデモを表示
function showFileExplorerDemo() {
    const demoDisplay = document.getElementById("demo-display");

    demoDisplay.innerHTML = `
        <div class="demo-container file-explorer-demo">
            <div class="demo-header">
                <h2>📁 ファイルエクスプローラー</h2>
                <p>ディレクトリの内容を表示し、ファイルやフォルダを閲覧できます。</p>
            </div>
            
            <div class="explorer-controls">
                <div class="path-display">
                    <strong>現在のパス:</strong> <span id="current-path">/tmp</span>
                </div>
                <button id="parent-dir-btn" class="btn btn-secondary">📁 親ディレクトリ</button>
                <button id="home-dir-btn" class="btn btn-secondary">🏠 ホーム</button>
            </div>
            
            <div id="file-list" class="file-list">
                <div class="loading">ディレクトリを読み込み中...</div>
            </div>
        </div>
    `;

    // 現在のパスを保持する変数 - 確実に存在するパスを使用
    let currentPath = navigator.platform.includes("Win") ? "C:\\" : "/tmp";

    const currentPathSpan = document.getElementById("current-path");
    const fileList = document.getElementById("file-list");
    const parentDirBtn = document.getElementById("parent-dir-btn");
    const homeDirBtn = document.getElementById("home-dir-btn");

    // ディレクトリ内容を読み込む関数
    const loadDirectory = async (path) => {
        try {
            fileList.innerHTML = '<div class="loading">読み込み中...</div>';
            currentPath = path;
            currentPathSpan.textContent = path;

            // Tauriが利用可能かチェック
            if (!window.__TAURI__ || !window.__TAURI__.core) {
                throw new Error("Tauri APIが利用できません");
            }

            const entries = await window.__TAURI__.core.invoke(
                "list_directory",
                { dirPath: path }
            );

            if (entries.length === 0) {
                fileList.innerHTML =
                    '<div class="empty-directory">このディレクトリは空です</div>';
                return;
            }

            const entriesHtml = entries
                .map((entry) => {
                    const icon = entry.is_dir ? "📁" : "📄";
                    const sizeText = entry.is_dir
                        ? ""
                        : `<span class="file-size">${formatBytes(
                              entry.size || 0
                          )}</span>`;

                    return `
                    <div class="file-item ${
                        entry.is_dir ? "directory" : "file"
                    }" data-path="${entry.path}">
                        <span class="file-icon">${icon}</span>
                        <span class="file-name">${entry.name}</span>
                        ${sizeText}
                    </div>
                `;
                })
                .join("");

            fileList.innerHTML = entriesHtml;

            // ファイル/ディレクトリクリックイベントを追加
            fileList.addEventListener("click", (e) => {
                const fileItem = e.target.closest(".file-item");
                if (fileItem) {
                    const path = fileItem.dataset.path;
                    const isDirectory =
                        fileItem.classList.contains("directory");

                    if (isDirectory) {
                        loadDirectory(path);
                    }
                }
            });
        } catch (error) {
            console.error("ディレクトリ読み込みエラー:", error);
            fileList.innerHTML = `<div class="error">ディレクトリの読み込みに失敗しました: ${error}</div>`;
        }
    };

    // 親ディレクトリボタンのイベント
    parentDirBtn.addEventListener("click", () => {
        const isWindows = navigator.platform.includes("Win");
        const parentPath =
            currentPath
                .split(/[/\\]/)
                .slice(0, -1)
                .join(isWindows ? "\\" : "/") || (isWindows ? "C:\\" : "/");
        loadDirectory(parentPath);
    });

    // ホームディレクトリボタンのイベント
    homeDirBtn.addEventListener("click", () => {
        // macOSの場合は/Users、Linuxの場合は/homeを使用
        const homePath = navigator.platform.includes("Win")
            ? "C:\\Users"
            : "/Users";
        loadDirectory(homePath);
    });

    // 初期ディレクトリを読み込み
    loadDirectory(currentPath);
}

// ========== ローカルデータベースデモ ==========
function showDatabaseMemoDemo() {
    const demoDisplay = document.getElementById("demo-display");
    if (!demoDisplay) return;

    demoDisplay.innerHTML = `
        <div class="demo-container database-memo-demo">
            <h2>💾 ローカルデータベースデモ</h2>
            <p>SQLiteを使ったメモアプリケーション。CRUD操作とデータの永続化を実演します。</p>
            
            <div class="database-stats">
                <h3>📊 データベース統計</h3>
                <div id="database-stats-display">統計を読み込み中...</div>
                <button id="refresh-stats">統計を更新</button>
            </div>

            <div class="memo-form">
                <h3>✏️ メモの作成・編集</h3>
                <input type="hidden" id="memo-id" value="">
                <div class="form-group">
                    <label for="memo-title">タイトル:</label>
                    <input type="text" id="memo-title" placeholder="メモのタイトルを入力">
                </div>
                <div class="form-group">
                    <label for="memo-content">内容:</label>
                    <textarea id="memo-content" rows="4" placeholder="メモの内容を入力"></textarea>
                </div>
                <div class="form-actions">
                    <button id="save-memo" class="primary">💾 保存</button>
                    <button id="cancel-edit" class="secondary" style="display: none;">❌ キャンセル</button>
                </div>
            </div>

            <div class="memo-search">
                <h3>🔍 メモの検索</h3>
                <div class="search-group">
                    <input type="text" id="search-query" placeholder="検索キーワードを入力">
                    <button id="search-memos">🔍 検索</button>
                    <button id="show-all-memos">📋 全て表示</button>
                </div>
            </div>

            <div class="memo-list">
                <h3>📝 メモ一覧</h3>
                <div id="memos-display">メモを読み込み中...</div>
            </div>
        </div>
    `;

    // イベントリスナーを設定
    setupDatabaseMemoEvents();

    // 初期データを読み込み
    loadDatabaseStats();
    loadAllMemos();
}

function setupDatabaseMemoEvents() {
    // 統計更新
    document
        .getElementById("refresh-stats")
        ?.addEventListener("click", loadDatabaseStats);

    // メモ保存
    document.getElementById("save-memo")?.addEventListener("click", saveMemo);

    // 編集キャンセル
    document
        .getElementById("cancel-edit")
        ?.addEventListener("click", cancelEdit);

    // 検索
    document
        .getElementById("search-memos")
        ?.addEventListener("click", searchMemos);
    document
        .getElementById("search-query")
        ?.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                searchMemos();
            }
        });

    // 全メモ表示
    document
        .getElementById("show-all-memos")
        ?.addEventListener("click", loadAllMemos);
}

async function loadDatabaseStats() {
    try {
        const statsDisplay = document.getElementById("database-stats-display");
        if (!statsDisplay) return;

        statsDisplay.textContent = "統計を読み込み中...";

        const stats = await window.__TAURI__.core.invoke("get_database_stats");

        const formattedSize = formatBytes(stats.database_size);

        statsDisplay.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">総メモ数:</span>
                    <span class="stat-value">${stats.total_memos}件</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">データベースサイズ:</span>
                    <span class="stat-value">${formattedSize}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">データベースパス:</span>
                    <span class="stat-value" title="${
                        stats.database_path
                    }">${stats.database_path.split("/").pop()}</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("統計の読み込みエラー:", error);
        document.getElementById(
            "database-stats-display"
        ).innerHTML = `<div class="error">統計の読み込みに失敗しました: ${error}</div>`;
    }
}

async function loadAllMemos() {
    try {
        const memosDisplay = document.getElementById("memos-display");
        if (!memosDisplay) return;

        memosDisplay.innerHTML =
            '<div class="loading">メモを読み込み中...</div>';

        const memos = await window.__TAURI__.core.invoke("get_all_memos");

        displayMemos(memos);
    } catch (error) {
        console.error("メモの読み込みエラー:", error);
        document.getElementById(
            "memos-display"
        ).innerHTML = `<div class="error">メモの読み込みに失敗しました: ${error}</div>`;
    }
}

async function searchMemos() {
    try {
        const query = document.getElementById("search-query")?.value.trim();
        if (!query) {
            loadAllMemos();
            return;
        }

        const memosDisplay = document.getElementById("memos-display");
        if (!memosDisplay) return;

        memosDisplay.innerHTML = '<div class="loading">検索中...</div>';

        const memos = await window.__TAURI__.core.invoke("search_memos", {
            query,
        });

        displayMemos(memos, `検索結果: "${query}"`);
    } catch (error) {
        console.error("検索エラー:", error);
        document.getElementById(
            "memos-display"
        ).innerHTML = `<div class="error">検索に失敗しました: ${error}</div>`;
    }
}

function displayMemos(memos, title = "メモ一覧") {
    const memosDisplay = document.getElementById("memos-display");
    if (!memosDisplay) return;

    if (memos.length === 0) {
        memosDisplay.innerHTML = `
            <div class="empty-state">
                <p>📝 メモがありません</p>
                <p>上のフォームから新しいメモを作成してください。</p>
            </div>
        `;
        return;
    }

    const memosHtml = memos
        .map((memo) => {
            const createdDate = new Date(memo.created_at).toLocaleString(
                "ja-JP"
            );
            const updatedDate = new Date(memo.updated_at).toLocaleString(
                "ja-JP"
            );
            const isUpdated = memo.created_at !== memo.updated_at;

            return `
            <div class="memo-item" data-memo-id="${memo.id}">
                <div class="memo-header">
                    <h4 class="memo-title">${escapeHtml(memo.title)}</h4>
                    <div class="memo-actions">
                        <button class="edit-memo" data-memo-id="${
                            memo.id
                        }">✏️ 編集</button>
                        <button class="delete-memo" data-memo-id="${
                            memo.id
                        }">🗑️ 削除</button>
                    </div>
                </div>
                <div class="memo-content">${escapeHtml(memo.content)}</div>
                <div class="memo-meta">
                    <span class="memo-date">作成: ${createdDate}</span>
                    ${
                        isUpdated
                            ? `<span class="memo-date updated">更新: ${updatedDate}</span>`
                            : ""
                    }
                </div>
            </div>
        `;
        })
        .join("");

    memosDisplay.innerHTML = `
        <div class="memos-header">
            <span class="memos-title">${title} (${memos.length}件)</span>
        </div>
        <div class="memos-list">
            ${memosHtml}
        </div>
    `;

    // メモアクションのイベントリスナーを設定
    memosDisplay.querySelectorAll(".edit-memo").forEach((button) => {
        button.addEventListener("click", () =>
            editMemo(parseInt(button.dataset.memoId))
        );
    });

    memosDisplay.querySelectorAll(".delete-memo").forEach((button) => {
        button.addEventListener("click", () =>
            deleteMemo(parseInt(button.dataset.memoId))
        );
    });
}

async function saveMemo() {
    try {
        const title = document.getElementById("memo-title")?.value.trim();
        const content = document.getElementById("memo-content")?.value.trim();
        const memoId = document.getElementById("memo-id")?.value;

        if (!title || !content) {
            alert("タイトルと内容を入力してください。");
            return;
        }

        const saveButton = document.getElementById("save-memo");
        if (saveButton) {
            saveButton.textContent = "保存中...";
            saveButton.disabled = true;
        }

        let result;
        if (memoId) {
            // 更新
            result = await window.__TAURI__.core.invoke("update_memo", {
                request: {
                    id: parseInt(memoId),
                    title,
                    content,
                },
            });
        } else {
            // 新規作成
            result = await window.__TAURI__.core.invoke("create_memo", {
                request: { title, content },
            });
        }

        // フォームをリセット
        document.getElementById("memo-title").value = "";
        document.getElementById("memo-content").value = "";
        document.getElementById("memo-id").value = "";
        document.getElementById("cancel-edit").style.display = "none";

        // メモ一覧を更新
        loadAllMemos();
        loadDatabaseStats();

        alert(memoId ? "メモを更新しました！" : "メモを作成しました！");
    } catch (error) {
        console.error("メモの保存エラー:", error);
        alert(`メモの保存に失敗しました: ${error}`);
    } finally {
        const saveButton = document.getElementById("save-memo");
        if (saveButton) {
            saveButton.textContent = "💾 保存";
            saveButton.disabled = false;
        }
    }
}

async function editMemo(memoId) {
    try {
        const memo = await window.__TAURI__.core.invoke("get_memo_by_id", {
            id: memoId,
        });

        if (!memo) {
            alert("メモが見つかりませんでした。");
            return;
        }

        document.getElementById("memo-id").value = memo.id;
        document.getElementById("memo-title").value = memo.title;
        document.getElementById("memo-content").value = memo.content;
        document.getElementById("cancel-edit").style.display = "inline-block";

        // フォームまでスクロール
        document
            .querySelector(".memo-form")
            .scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        console.error("メモ編集エラー:", error);
        alert(`メモの編集に失敗しました: ${error}`);
    }
}

async function deleteMemo(memoId) {
    if (!confirm("このメモを削除してもよろしいですか？")) {
        return;
    }

    try {
        const result = await window.__TAURI__.core.invoke("delete_memo", {
            id: memoId,
        });

        if (result) {
            loadAllMemos();
            loadDatabaseStats();
            alert("メモを削除しました。");
        } else {
            alert("メモの削除に失敗しました。");
        }
    } catch (error) {
        console.error("メモ削除エラー:", error);
        alert(`メモの削除に失敗しました: ${error}`);
    }
}

function cancelEdit() {
    document.getElementById("memo-id").value = "";
    document.getElementById("memo-title").value = "";
    document.getElementById("memo-content").value = "";
    document.getElementById("cancel-edit").style.display = "none";
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
