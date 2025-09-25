import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import DemoList from "./DemoList";
import DemoDisplay from "./DemoDisplay";

function App() {
    const [demos, setDemos] = useState([]);
    const [activeDemoId, setActiveDemoId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // デモ一覧を取得
    useEffect(() => {
        async function loadDemos() {
            try {
                const demoList = await invoke("get_demo_list");
                setDemos(demoList);
            } catch (error) {
                console.error("デモ一覧の取得に失敗しました:", error);
                setDemos([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadDemos();
    }, []);

    // リロード処理
    const handleReload = () => {
        window.location.reload();
    };

    // キーボードショートカットの設定
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd+R (macOS) または Ctrl+R (Windows/Linux) でリロード
            if ((e.metaKey || e.ctrlKey) && e.key === "r") {
                e.preventDefault();
                handleReload();
            }

            // F5キーでもリロード
            if (e.key === "F5") {
                e.preventDefault();
                handleReload();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (isLoading) {
        return (
            <div className="app-container">
                <div className="loading">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <div>
                        <h1>🚀 Tauri デモアプリケーション</h1>
                        <p>スタンドアロンTauriアプリケーションのデモ集</p>
                    </div>
                    <button className="reload-btn" onClick={handleReload}>
                        🔄 リロード
                    </button>
                </div>
            </header>

            <main className="app-main">
                <aside className="demo-sidebar">
                    <DemoList
                        demos={demos}
                        activeDemoId={activeDemoId}
                        onDemoSelect={setActiveDemoId}
                    />
                </aside>

                <section className="demo-content">
                    <DemoDisplay demoId={activeDemoId} />
                </section>
            </main>
        </div>
    );
}

export default App;
