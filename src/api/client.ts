import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { ApiError, ApiSuccess } from "@/types/api";

/** localStorage 中保存 token 的键名 */
const TOKEN_KEY = "shiguang_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** 触发登出（避免循环依赖：由外部注入回调） */
let onUnauthorized: (() => void) | null = null;
export function registerUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

/**
 * API 基础地址：
 * - 开发环境：走 Vite 代理（/api → localhost:3000）
 * - 生产环境：通过 VITE_API_BASE_URL 配置后端地址（如 https://api.xxx.com）
 */
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "/api";

/** axios 实例 */
const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截：自动注入 Bearer token
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：拆解统一响应包 + 处理错误
client.interceptors.response.use(
  (response) => {
    const body = response.data as ApiSuccess<unknown>;
    // 直接返回 data 字段，调用方拿到的是业务数据
    return body.data as any;
  },
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const body = error.response?.data;

    // 401：清 token + 触发跳转
    if (status === 401) {
      clearToken();
      if (onUnauthorized) onUnauthorized();
    }

    const message =
      body?.message ||
      (error.request
        ? "网络异常，请稍后重试"
        : "请求失败，请检查网络");
    // 抛出标准 Error，调用方可用 instanceof Error 或 try/catch
    return Promise.reject(new Error(message));
  }
);

export default client;
