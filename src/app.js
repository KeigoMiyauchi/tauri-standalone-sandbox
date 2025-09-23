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
    `;

        console.log("Demo list HTML set"); // デバッグ用

        // クリックイベントを追加
        demoList.addEventListener("click", (e) => {
            const button = e.target.closest("button[data-demo-id]");
            if (button && demoDisplay) {
                const demoId = button.dataset.demoId;
                console.log("Demo clicked:", demoId); // デバッグ用

                // アクティブ状態を更新
                demoList.querySelectorAll("button").forEach((btn) => {
                    btn.classList.remove("active");
                });
                button.classList.add("active");

                // デモ表示エリアを更新
                if (demoId === "hello-world") {
                    showHelloWorldDemo();
                } else if (demoId === "image-viewer") {
                    showImageViewerDemo();
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
                    const selected = await window.__TAURI__.plugin.dialog.open({
                        multiple: false,
                        filters: [
                            {
                                name: "Images",
                                extensions: [
                                    "png",
                                    "jpg",
                                    "jpeg",
                                    "gif",
                                    "bmp",
                                    "webp",
                                ],
                            },
                        ],
                    });

                    if (selected) {
                        try {
                            const imageData =
                                await window.__TAURI__.core.invoke(
                                    "read_image_file",
                                    { path: selected }
                                );
                            const fileInfo = await window.__TAURI__.core.invoke(
                                "get_file_info",
                                { path: selected }
                            );

                            display.innerHTML = `
                <img src="data:image/${
                    fileInfo.extension
                };base64,${imageData}" alt="選択された画像" />
                <div class="image-info">
                  <h4>ファイル情報</h4>
                  <p>ファイル名: ${fileInfo.name}</p>
                  <p>サイズ: ${(fileInfo.size / 1024).toFixed(2)} KB</p>
                  <p>パス: ${selected}</p>
                </div>
              `;
                            display.classList.add("has-image");
                        } catch (error) {
                            display.innerHTML = `<div class="image-placeholder">画像の読み込みエラー: ${error}</div>`;
                        }
                    }
                } catch (error) {
                    console.error("ファイル選択エラー:", error);
                }
            });
        }
    }, 0);
}
