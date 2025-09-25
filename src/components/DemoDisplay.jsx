import React from "react";
import HelloWorldDemo from "./demos/HelloWorldDemo";
import ImageViewerDemo from "./demos/ImageViewerDemo";
import SystemInfoDemo from "./demos/SystemInfoDemo";
import FileExplorerDemo from "./demos/FileExplorerDemo";
import DatabaseMemoDemo from "./demos/DatabaseMemoDemo";
import RealtimeChartsDemo from "./demos/RealtimeChartsDemo";

function DemoDisplay({ demoId }) {
    if (!demoId) {
        return (
            <div id="demo-display" className="welcome-message">
                <h2>🎉 Tauri React デモアプリケーションへようこそ！</h2>
                <p>左側のリストからデモを選択してください。</p>
                <div className="feature-list">
                    <h3>✨ 実装済み機能</h3>
                    <ul>
                        <li>🌍 Hello World デモ</li>
                        <li>🖼️ 画像ビューア</li>
                        <li>💻 システム情報表示</li>
                        <li>📁 ファイルエクスプローラー</li>
                        <li>📝 データベースメモ</li>
                        <li>📊 リアルタイムチャート</li>
                    </ul>
                </div>
            </div>
        );
    }

    // デモIDに応じてコンポーネントを表示
    switch (demoId) {
        case "hello-world":
            return <HelloWorldDemo />;
        case "image-viewer":
            return <ImageViewerDemo />;
        case "system-info":
            return <SystemInfoDemo />;
        case "file-explorer":
            return <FileExplorerDemo />;
        case "database-memo":
            return <DatabaseMemoDemo />;
        case "realtime-charts":
            return <RealtimeChartsDemo />;
        default:
            return (
                <div id="demo-display" className="error-message">
                    <h2>❌ 不明なデモです</h2>
                    <p>デモID: {demoId}</p>
                </div>
            );
    }
}

export default DemoDisplay;
