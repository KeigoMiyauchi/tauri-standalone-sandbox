import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

function SystemInfoDemo() {
    const [systemInfo, setSystemInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSystemInfo = async () => {
        setIsLoading(true);
        try {
            const info = await invoke("get_system_info");
            setSystemInfo(info);
        } catch (error) {
            console.error("システム情報取得エラー:", error);
            setSystemInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemInfo();
    }, []);

    return (
        <div id="demo-display">
            <div className="demo-content">
                <h2>💻 システム情報デモ</h2>
                <p>現在のシステム情報を表示します。</p>

                <div className="demo-section">
                    <button
                        className="demo-button primary"
                        onClick={fetchSystemInfo}
                        disabled={isLoading}
                    >
                        {isLoading ? "取得中..." : "🔄 情報を更新"}
                    </button>

                    {systemInfo && (
                        <div className="system-info">
                            <h3>システム情報:</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <strong>OS:</strong> {systemInfo.os_name}
                                </div>
                                <div className="info-item">
                                    <strong>OSバージョン:</strong>{" "}
                                    {systemInfo.os_version}
                                </div>
                                <div className="info-item">
                                    <strong>ホスト名:</strong>{" "}
                                    {systemInfo.hostname}
                                </div>
                                <div className="info-item">
                                    <strong>アーキテクチャ:</strong>{" "}
                                    {systemInfo.architecture}
                                </div>
                                <div className="info-item">
                                    <strong>総メモリ:</strong>{" "}
                                    {systemInfo.total_memory} GB
                                </div>
                                <div className="info-item">
                                    <strong>使用可能メモリ:</strong>{" "}
                                    {systemInfo.available_memory} GB
                                </div>
                                <div className="info-item">
                                    <strong>CPU数:</strong>{" "}
                                    {systemInfo.cpu_count}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="demo-info">
                    <h3>📋 機能説明</h3>
                    <ul>
                        <li>OS情報の取得</li>
                        <li>ハードウェア情報の表示</li>
                        <li>メモリ使用状況の確認</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default SystemInfoDemo;
