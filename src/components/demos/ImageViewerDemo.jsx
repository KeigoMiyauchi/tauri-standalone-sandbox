import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function ImageViewerDemo() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const selectImage = async () => {
        setIsLoading(true);
        try {
            const selected = await invoke("select_image_file");

            if (selected) {
                // 画像ファイルを読み込んでBase64で取得
                const imageData = await invoke("read_image_file", {
                    filePath: selected,
                });

                setSelectedImage({
                    path: selected,
                    data: imageData,
                });
            }
        } catch (error) {
            console.error("画像選択エラー:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="demo-display">
            <div className="demo-content">
                <h2>🖼️ 画像ビューアデモ</h2>
                <p>画像ファイルを選択して表示するデモです。</p>

                <div className="demo-section">
                    <button
                        className="demo-button primary"
                        onClick={selectImage}
                        disabled={isLoading}
                    >
                        {isLoading ? "読み込み中..." : "📁 画像を選択"}
                    </button>

                    {!selectedImage && !isLoading && (
                        <div className="image-display">
                            <div className="image-placeholder">
                                <p>🖼️ 画像ファイルを選択してください</p>
                                <p>対応形式: PNG, JPG, JPEG, GIF, BMP, WebP</p>
                            </div>
                        </div>
                    )}

                    {selectedImage && (
                        <div className="image-display has-image">
                            <img
                                src={`data:image/*;base64,${selectedImage.data}`}
                                alt="選択された画像"
                                style={{ maxWidth: "100%", maxHeight: "400px" }}
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display =
                                        "block";
                                }}
                            />
                            <div
                                style={{ display: "none" }}
                                className="error-message"
                            >
                                画像の読み込みに失敗しました
                            </div>
                            <div className="image-info">
                                <p>
                                    <strong>ファイルパス:</strong>{" "}
                                    {selectedImage.path}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="demo-info">
                    <h3>📋 使用方法</h3>
                    <ul>
                        <li>「画像を選択」ボタンをクリック</li>
                        <li>ファイル選択ダイアログで画像を選択</li>
                        <li>選択した画像がプレビュー表示されます</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ImageViewerDemo;
