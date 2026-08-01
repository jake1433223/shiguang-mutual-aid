import { create } from "zustand";
import { authApi } from "@/api/auth";
import { clearToken, getToken, setToken } from "@/api/client";
import type { LoginPayload, RegisterPayload, User } from "@/types/api";

interface AuthState {
  user: User | null;
  /** 是否已尝试过初始化（避免登录页闪烁） */
  initialized: boolean;
  /** 登录 */
  login: (payload: LoginPayload) => Promise<User>;
  /** 注册 */
  register: (payload: RegisterPayload) => Promise<User>;
  /** 登出 */
  logout: () => void;
  /** 启动时拉取当前用户（基于 localStorage 中的 token） */
  bootstrap: () => Promise<void>;
  /** 更新本地缓存的 user（用于个人资料修改后同步） */
  patchUser: (patch: Partial<User> | ((u: User) => User)) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,

  async login(payload) {
    const { user, token } = await authApi.login(payload);
    setToken(token);
    set({ user });
    return user;
  },

  async register(payload) {
    const { user, token } = await authApi.register(payload);
    setToken(token);
    set({ user });
    return user;
  },

  logout() {
    clearToken();
    set({ user: null });
  },

  async bootstrap() {
    const token = getToken();
    if (!token) {
      set({ initialized: true, user: null });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, initialized: true });
    } catch {
      clearToken();
      set({ user: null, initialized: true });
    }
  },

  patchUser(patch) {
    const cur = get().user;
    if (!cur) return;
    const next = typeof patch === "function" ? patch(cur) : { ...cur, ...patch };
    set({ user: next });
  },
}));

/** 是否已登录（仅用于 UI 判断） */
export const useIsAuthenticated = () => useAuthStore((s) => !!s.user);
