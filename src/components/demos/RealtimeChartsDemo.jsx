import React, { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

function RealtimeChartsDemo() {
    const [isRunning, setIsRunning] = useState(false);
    const [metrics, setMetrics] = useState({ cpu: 0, memory: 0 });
    const intervalRef = useRef(null);
    const cpuChartRef = useRef(null);
    const memoryChartRef = useRef(null);
    const cpuChartInstance = useRef(null);
    const memoryChartInstance = useRef(null);

    // Chart.jsの初期化
    useEffect(() => {
        // Chart.jsがロードされるまで待機
        const checkChartJS = () => {
            if (window.Chart) {
                initializeCharts();
            } else {
                setTimeout(checkChartJS, 100);
            }
        };
        checkChartJS();

        return () => {
            // クリーンアップ
            if (cpuChartInstance.current) {
                cpuChartInstance.current.destroy();
            }
            if (memoryChartInstance.current) {
                memoryChartInstance.current.destroy();
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const initializeCharts = () => {
        if (!cpuChartRef.current || !memoryChartRef.current) return;

        const commonOptions = {
            responsive: true,
            animation: {
                duration: 0, // アニメーションを無効化してパフォーマンス向上
            },
            scales: {
                x: {
                    type: "linear",
                    position: "bottom",
                    title: {
                        display: true,
                        text: "時刻",
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            // タイムスタンプを時:分:秒の形式で表示
                            const date = new Date(value);
                            return date.toLocaleTimeString("ja-JP", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            });
                        },
                        maxTicksLimit: 8, // 表示するティック数を制限
                    },
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: "使用率 (%)",
                    },
                    ticks: {
                        callback: function (value) {
                            return value + "%";
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    display: true,
                },
            },
            interaction: {
                intersect: false,
            },
            elements: {
                point: {
                    radius: 2,
                },
            },
        };

        // CPU使用率チャート
        cpuChartInstance.current = new window.Chart(cpuChartRef.current, {
            type: "line",
            data: {
                datasets: [
                    {
                        label: "CPU使用率 (%)",
                        data: [],
                        borderColor: "rgb(75, 192, 192)",
                        backgroundColor: "rgba(75, 192, 192, 0.1)",
                        tension: 0.1,
                    },
                ],
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: "CPU使用率",
                    },
                },
            },
        });

        // メモリ使用率チャート
        memoryChartInstance.current = new window.Chart(memoryChartRef.current, {
            type: "line",
            data: {
                datasets: [
                    {
                        label: "メモリ使用率 (%)",
                        data: [],
                        borderColor: "rgb(255, 99, 132)",
                        backgroundColor: "rgba(255, 99, 132, 0.1)",
                        tension: 0.1,
                    },
                ],
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: "メモリ使用率",
                    },
                },
            },
        });
    };

    const fetchMetrics = async () => {
        try {
            const data = await invoke("get_realtime_metrics");
            const newMetrics = {
                cpu: parseFloat(data.cpu_usage.toFixed(1)),
                memory: parseFloat(data.memory_usage.toFixed(1)),
            };

            setMetrics(newMetrics);

            // チャートにデータを追加
            if (cpuChartInstance.current && memoryChartInstance.current) {
                const now = Date.now();
                const maxDataPoints = 20; // 最大データポイント数

                // CPUチャートにデータを追加
                const cpuDataset = cpuChartInstance.current.data.datasets[0];
                cpuDataset.data.push({
                    x: now,
                    y: newMetrics.cpu,
                });

                // 古いデータポイントを削除
                if (cpuDataset.data.length > maxDataPoints) {
                    cpuDataset.data.shift();
                }

                // メモリチャートにデータを追加
                const memoryDataset =
                    memoryChartInstance.current.data.datasets[0];
                memoryDataset.data.push({
                    x: now,
                    y: newMetrics.memory,
                });

                // 古いデータポイントを削除
                if (memoryDataset.data.length > maxDataPoints) {
                    memoryDataset.data.shift();
                }

                // X軸の範囲を更新（最新の20秒間を表示）
                const duration = 20000; // 20秒
                const minTime = now - duration;
                const maxTime = now;

                // CPUチャートのX軸範囲を更新
                cpuChartInstance.current.options.scales.x.min = minTime;
                cpuChartInstance.current.options.scales.x.max = maxTime;

                // メモリチャートのX軸範囲を更新
                memoryChartInstance.current.options.scales.x.min = minTime;
                memoryChartInstance.current.options.scales.x.max = maxTime;

                // チャートを更新
                cpuChartInstance.current.update("none");
                memoryChartInstance.current.update("none");
            }
        } catch (error) {
            console.error("メトリクス取得エラー:", error);
        }
    };

    const startMonitoring = () => {
        setIsRunning(true);
        intervalRef.current = setInterval(fetchMetrics, 1000);
    };

    const stopMonitoring = () => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const clearCharts = () => {
        if (cpuChartInstance.current && memoryChartInstance.current) {
            cpuChartInstance.current.data.datasets[0].data = [];
            memoryChartInstance.current.data.datasets[0].data = [];
            cpuChartInstance.current.update();
            memoryChartInstance.current.update();
        }
    };

    return (
        <div id="demo-display">
            <div className="demo-content">
                <h2>📊 リアルタイムチャートデモ</h2>
                <p>
                    システムのCPU使用率とメモリ使用率をリアルタイムで監視します。
                </p>

                <div className="chart-controls">
                    <button
                        className={`demo-button ${
                            isRunning ? "secondary" : "primary"
                        }`}
                        onClick={isRunning ? stopMonitoring : startMonitoring}
                    >
                        {isRunning ? "⏹️ 停止" : "▶️ 開始"}
                    </button>
                    <button
                        className="demo-button secondary"
                        onClick={clearCharts}
                    >
                        🗑️ クリア
                    </button>
                </div>

                <div className="metrics-summary">
                    <div className="metric-card">
                        <h3>💻 CPU使用率</h3>
                        <div className="metric-value">{metrics.cpu}%</div>
                    </div>
                    <div className="metric-card">
                        <h3>🧠 メモリ使用率</h3>
                        <div className="metric-value">{metrics.memory}%</div>
                    </div>
                </div>

                <div className="charts-container">
                    <div className="chart-section">
                        <canvas ref={cpuChartRef} id="cpu-chart"></canvas>
                    </div>
                    <div className="chart-section">
                        <canvas ref={memoryChartRef} id="memory-chart"></canvas>
                    </div>
                </div>

                <div className="demo-info">
                    <h3>📋 機能説明</h3>
                    <ul>
                        <li>リアルタイムシステム監視</li>
                        <li>Chart.jsを使用したグラフ表示</li>
                        <li>定期的なデータ更新</li>
                        <li>開始/停止/クリア機能</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default RealtimeChartsDemo;
