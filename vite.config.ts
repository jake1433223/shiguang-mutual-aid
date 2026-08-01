import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    build: {
      sourcemap: isProd ? "hidden" : true,
      // 代码分割：按需加载路由页面
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "query-vendor": ["@tanstack/react-query", "axios", "zustand"],
            "animation-vendor": ["framer-motion"],
          },
        },
      },
      // 压缩优化
      minify: "esbuild",
      target: "es2020",
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
    },
    plugins: [
      // react-dev-locator 仅开发模式使用
      react({
        babel: {
          plugins: isProd ? [] : ["react-dev-locator"],
        },
      }),
      tsconfigPaths(),
    ],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        // 开发期把 /api 转发到 NestJS 后端（默认 3000 端口）
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
  };
});
