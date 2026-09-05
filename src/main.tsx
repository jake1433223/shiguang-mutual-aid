import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { useAuthStore } from "@/store/useAuthStore";
import { registerUnauthorizedHandler } from "@/api/client";
import "./index.css";

// React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 路由切换后保持缓存 5 分钟
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 401 → 登出 + 清缓存
registerUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
  queryClient.clear();
});

// 启动时拉取当前用户（基于 localStorage token）
useAuthStore.getState().bootstrap();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

// PWA：生产环境注册 Service Worker
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  });
}