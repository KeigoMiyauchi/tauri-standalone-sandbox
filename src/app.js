// Tauriアプリケーション用JavaScript（完全スタンドアロン版）
// 更新テスト: リロード確認

// キーボードショートカットでリロード機能を追加
document.addEventListener("keydown", (e) => {
    // Cmd+R (macOS) または Ctrl+R (Windows/Linux) でリロード
    if ((e.metaKey || e.ctrlKey) && e.key === "r") {
        e.preventDefault();
        console.log("Manual reload triggered");
        location.reload();
    }

    // F5キーでもリロード
    if (e.key === "F5") {
        e.preventDefault();
        console.log("F5 reload triggered");
        location.reload();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded triggered"); // デバッグ用

    // リロードボタンの設定
    const reloadBtn = document.getElementById("reload-btn");
    if (reloadBtn) {
        reloadBtn.addEventListener("click", () => {
            console.log("Reload button clicked");
            location.reload();
        });
    }

    const demoList = document.getElementById("demo-list");
    const demoDisplay = document.getElementById("demo-display");

    console.log("demoList:", demoList); // デバッグ用
    console.log("demoDisplay:", demoDisplay); // デバッグ用

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
    `;

        console.log("Demo list HTML set"); // デバッグ用

        // クリックイベントを追加
        demoList.addEventListener("click", (e) => {
            const button = e.target.closest("button[data-demo-id]");
            if (button && demoDisplay) {
                const demoId = button.dataset.demoId;
                console.log("Selected demo:", demoId);
                if (demoId === "hello-world") {
                    showHelloWorldDemo();
                } else if (demoId === "image-viewer") {
                    showImageViewerDemo();
                } else if (demoId === "system-info") {
                    showSystemInfoDemo();
                }
            }
        });
    } else {
        console.error("demo-list element not found"); // デバッグ用
    }
});

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
                    console.log("画像選択ボタンがクリックされました");
                    button.textContent = "選択中...";
                    button.disabled = true;

                    // Tauri invoke APIを使用してカスタムコマンドでファイル選択
                    const selected = await window.__TAURI__.core.invoke(
                        "select_image_file"
                    );

                    console.log("選択されたファイル:", selected);

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
                    console.log("システム情報:", systemInfo);

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
