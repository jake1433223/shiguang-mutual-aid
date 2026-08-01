import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/useAuthStore";
import type { LoginPayload, RegisterPayload } from "@/types/api";

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useRegisterMutation() {
  const register = useAuthStore((s) => s.register);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

/** 用于刷新 me（如有需要） */
export function useMeQuery() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
    enabled: false, // 默认不主动拉，store 自身已 bootstrap
    initialData: user ?? undefined,
  });
}
