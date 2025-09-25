import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

function DatabaseMemoDemo() {
    const [memos, setMemos] = useState([]);
    const [selectedMemo, setSelectedMemo] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // シンプルなメモアプリとして動作（カテゴリ機能は将来の実装として保留）

    // メモ一覧を読み込み
    const loadMemos = async () => {
        setLoading(true);
        setError("");

        try {
            const result = await invoke("get_all_memos");
            setMemos(result || []);
        } catch (err) {
            console.error("メモの読み込みに失敗:", err);
            setError(`メモの読み込みに失敗しました: ${err.message || err}`);
            setMemos([]);
        } finally {
            setLoading(false);
        }
    };

    // 初回読み込み
    useEffect(() => {
        loadMemos();
    }, []);

    // 新しいメモを作成
    const createMemo = async () => {
        if (!title.trim()) {
            setError("タイトルを入力してください");
            return;
        }

        try {
            await invoke("create_memo", {
                request: {
                    title: title.trim(),
                    content: content.trim(),
                },
            });

            // フォームをリセット
            setTitle("");
            setContent("");
            setError("");

            // メモ一覧を再読み込み
            await loadMemos();
        } catch (err) {
            console.error("メモの作成に失敗:", err);
            setError(`メモの作成に失敗しました: ${err.message || err}`);
        }
    };

    // メモを更新
    const updateMemo = async () => {
        if (!selectedMemo || !title.trim()) {
            setError("タイトルを入力してください");
            return;
        }

        try {
            await invoke("update_memo", {
                request: {
                    id: selectedMemo.id,
                    title: title.trim(),
                    content: content.trim(),
                },
            });

            setError("");
            setSelectedMemo(null);

            // メモ一覧を再読み込み
            await loadMemos();
        } catch (err) {
            console.error("メモの更新に失敗:", err);
            setError(`メモの更新に失敗しました: ${err.message || err}`);
        }
    };

    // メモを削除
    const deleteMemo = async (id) => {
        if (!confirm("このメモを削除しますか？")) {
            return;
        }

        try {
            await invoke("delete_memo", { id });

            if (selectedMemo && selectedMemo.id === id) {
                setSelectedMemo(null);
                setTitle("");
                setContent("");
                // カテゴリ機能は将来の実装として保留
            }

            // メモ一覧を再読み込み
            await loadMemos();
        } catch (err) {
            console.error("メモの削除に失敗:", err);
            setError(`メモの削除に失敗しました: ${err.message || err}`);
        }
    };

    // メモを選択
    const selectMemo = (memo) => {
        setSelectedMemo(memo);
        setTitle(memo.title);
        setContent(memo.content);
        setError("");
    };

    // 新規作成モード
    const startNewMemo = () => {
        setSelectedMemo(null);
        setTitle("");
        setContent("");
        setError("");
    };

    // 検索フィルター
    const filteredMemos = memos.filter(
        (memo) =>
            memo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            memo.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 日付をフォーマット
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString("ja-JP");
    };

    return (
        <div id="demo-display">
            <div className="demo-content">
                <h2>📝 データベースメモデモ</h2>
                <p>SQLiteデータベースを使用したメモアプリのデモです。</p>

                <div className="demo-section">
                    <div className="memo-container">
                        {/* メモ一覧 */}
                        <div className="memo-sidebar">
                            <div className="memo-controls">
                                <button
                                    onClick={startNewMemo}
                                    className="new-memo-btn"
                                >
                                    ➕ 新しいメモ
                                </button>
                                <input
                                    type="text"
                                    placeholder="メモを検索..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="search-input"
                                />
                            </div>

                            {loading && (
                                <div className="loading">読み込み中...</div>
                            )}

                            <div className="memo-list">
                                {filteredMemos.map((memo) => (
                                    <div
                                        key={memo.id}
                                        className={`memo-item ${
                                            selectedMemo?.id === memo.id
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() => selectMemo(memo)}
                                    >
                                        <div className="memo-item-header">
                                            <span className="memo-title">
                                                {memo.title}
                                            </span>
                                            {/* カテゴリ表示は将来の実装として保留 */}
                                        </div>
                                        <div className="memo-preview">
                                            {memo.content.substring(0, 50)}
                                            {memo.content.length > 50
                                                ? "..."
                                                : ""}
                                        </div>
                                        <div className="memo-date">
                                            {formatDate(memo.updated_at)}
                                        </div>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteMemo(memo.id);
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* メモ編集エリア */}
                        <div className="memo-editor">
                            <div className="editor-header">
                                <h3>
                                    {selectedMemo ? "メモを編集" : "新しいメモ"}
                                </h3>

                                {/* カテゴリ選択は将来の実装として保留 */}
                            </div>

                            <input
                                type="text"
                                placeholder="メモのタイトル"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="title-input"
                            />

                            <textarea
                                placeholder="メモの内容を入力..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="content-textarea"
                                rows={15}
                            />

                            <div className="editor-actions">
                                {selectedMemo ? (
                                    <button
                                        onClick={updateMemo}
                                        className="save-btn"
                                    >
                                        💾 更新
                                    </button>
                                ) : (
                                    <button
                                        onClick={createMemo}
                                        className="save-btn"
                                    >
                                        💾 保存
                                    </button>
                                )}

                                <button
                                    onClick={startNewMemo}
                                    className="cancel-btn"
                                >
                                    ✖️ キャンセル
                                </button>
                            </div>

                            {error && <div className="error">{error}</div>}
                        </div>
                    </div>
                </div>

                <div className="demo-info">
                    <h3>📋 使用方法</h3>
                    <ul>
                        <li>「新しいメモ」ボタンでメモを作成</li>
                        <li>メモ一覧から編集したいメモを選択</li>
                        <li>検索ボックスでメモを絞り込み</li>
                        <li>カテゴリでメモを分類</li>
                        <li>🗑️ボタンでメモを削除</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default DatabaseMemoDemo;
