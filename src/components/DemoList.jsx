import React from "react";

function DemoList({ demos, activeDemoId, onDemoSelect }) {
    if (!demos || demos.length === 0) {
        return (
            <>
                <h2>📋 デモ一覧</h2>
                <nav className="demo-nav">
                    <ul className="demo-list">
                        <li className="demo-item">
                            <button disabled>
                                <span className="demo-title">
                                    ❌ デモの読み込みに失敗しました
                                </span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </>
        );
    }

    return (
        <>
            <h2>📋 デモ一覧</h2>
            <nav className="demo-nav">
                <ul className="demo-list">
                    {demos.map((demo) => (
                        <li key={demo.id} className="demo-item">
                            <button
                                className={
                                    activeDemoId === demo.id ? "active" : ""
                                }
                                onClick={() => onDemoSelect(demo.id)}
                            >
                                <span className="demo-title">
                                    {demo.icon} {demo.title}
                                </span>
                                <span className="demo-description">
                                    {demo.description}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
}

export default DemoList;
