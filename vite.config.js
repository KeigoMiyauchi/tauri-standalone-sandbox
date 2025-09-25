import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                main: "index-react.html",
            },
        },
    },
    server: {
        port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 3000,
        strictPort: true,
    },
    root: ".",
});
