import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

function FileExplorerDemo() {
    const [currentPath, setCurrentPath] = useState("");
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ホームディレクトリを取得
    useEffect(() => {
        const getHomeDir = async () => {
            try {
                const homeDir = await invoke("get_home_directory");
                setCurrentPath(homeDir);
            } catch (err) {
                console.error("ホームディレクトリの取得に失敗:", err);
                setCurrentPath("/");
            }
        };
        getHomeDir();
    }, []);

    // ファイルリストを読み込み
    const loadFiles = async (path) => {
        setLoading(true);
        setError("");

        try {
            const result = await invoke("read_directory", { path });
            setFiles(result);
            setCurrentPath(path);
        } catch (err) {
            console.error("ディレクトリの読み込みに失敗:", err);
            setError(
                `ディレクトリの読み込みに失敗しました: ${err.message || err}`
            );
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    // パスが変更されたときにファイルを読み込み
    useEffect(() => {
        if (currentPath) {
            loadFiles(currentPath);
        }
    }, [currentPath]);

    // ファイル/フォルダをクリック
    const handleItemClick = (item) => {
        if (item.is_dir) {
            loadFiles(item.path);
        } else {
            // ファイルの場合は情報を表示（実装可能）
            console.log("ファイルが選択されました:", item);
        }
    };

    // 親ディレクトリへ移動
    const goToParent = () => {
        const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
        loadFiles(parentPath);
    };

    // ファイルサイズをフォーマット
    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // 日付をフォーマット
    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString("ja-JP");
    };

    return (
        <div id="demo-display">
            <div className="demo-content">
                <h2>📁 ファイルエクスプローラーデモ</h2>
                <p>ファイルシステムを探索するデモです。</p>

                <div className="demo-section">
                    <div className="path-bar">
                        <button
                            onClick={goToParent}
                            disabled={currentPath === "/" || loading}
                        >
                            ⬆️ 親フォルダ
                        </button>
                        <span className="current-path">📂 {currentPath}</span>
                    </div>

                    {loading && <div className="loading">読み込み中...</div>}

                    {error && <div className="error">{error}</div>}

                    {!loading && !error && (
                        <div
                            className="file-list"
                            style={{ maxHeight: "400px", overflowY: "auto" }}
                        >
                            {files.length === 0 ? (
                                <div className="empty-folder">
                                    フォルダが空です
                                </div>
                            ) : (
                                <table className="file-table">
                                    <thead>
                                        <tr>
                                            <th>名前</th>
                                            <th>サイズ</th>
                                            <th>更新日時</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {files.map((item, index) => (
                                            <tr
                                                key={index}
                                                className={`file-item ${
                                                    item.is_dir
                                                        ? "directory"
                                                        : "file"
                                                }`}
                                                onClick={() =>
                                                    handleItemClick(item)
                                                }
                                            >
                                                <td className="file-name">
                                                    <span className="file-icon">
                                                        {item.is_dir
                                                            ? "📁"
                                                            : "📄"}
                                                    </span>
                                                    {item.name}
                                                </td>
                                                <td className="file-size">
                                                    {item.is_dir
                                                        ? "-"
                                                        : formatFileSize(
                                                              item.size || 0
                                                          )}
                                                </td>
                                                <td className="file-date">
                                                    {item.modified
                                                        ? formatDate(
                                                              item.modified
                                                          )
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>

                <div className="demo-info">
                    <h3>📋 使用方法</h3>
                    <ul>
                        <li>フォルダをクリックして移動</li>
                        <li>「親フォルダ」ボタンで上位ディレクトリへ</li>
                        <li>ファイル情報を表示（サイズ、更新日時）</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default FileExplorerDemo;
