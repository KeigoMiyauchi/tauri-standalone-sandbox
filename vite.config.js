import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    build: {
        outDir: "dist",
        rollupOptions: {
            // 静的ビルド用には軽量なindex.htmlを使用
            input: mode === "production" ? "index.html" : "index-react.html",
        },
    },
    server: {
        port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 3000,
        strictPort: true,
    },
    root: ".",
}));
