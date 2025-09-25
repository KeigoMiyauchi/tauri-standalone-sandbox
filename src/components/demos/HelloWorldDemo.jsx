import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function HelloWorldDemo() {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleGreet = async () => {
        setIsLoading(true);
        try {
            const response = await invoke("greet", {
                name: "React World",
            });
            setMessage(response);
        } catch (error) {
            console.error("Greet failed:", error);
            setMessage("エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="demo-display">
            <div className="demo-content">
                <h2>🌍 Hello World デモ</h2>
                <p>RustとReactが連携する基本的なデモです。</p>

                <div className="demo-section">
                    <button
                        className="demo-button primary"
                        onClick={handleGreet}
                        disabled={isLoading}
                    >
                        {isLoading ? "処理中..." : "挨拶を表示"}
                    </button>

                    {message && (
                        <div className="result">
                            <h3>結果:</h3>
                            <p className="message">{message}</p>
                        </div>
                    )}
                </div>

                <div className="demo-info">
                    <h3>📋 機能説明</h3>
                    <ul>
                        <li>React からRust関数を呼び出し</li>
                        <li>非同期処理の実装</li>
                        <li>エラーハンドリング</li>
                        <li>ローディング状態の管理</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default HelloWorldDemo;
