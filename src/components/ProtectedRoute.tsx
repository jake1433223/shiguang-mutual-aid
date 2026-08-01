import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * 路由守卫：未登录跳转到 /login，并在 state 中携带 from 路径，
 * 登录后可跳回原页面。
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const location = useLocation();

  // 还没初始化完（首次拉 me）：渲染 null 避免闪烁
  if (!initialized) return null;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return <>{children}</>;
}
