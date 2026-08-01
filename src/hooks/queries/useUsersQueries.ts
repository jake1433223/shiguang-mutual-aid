import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, type QueryTransactionsParams } from "@/api/users";
import { useAuthStore } from "@/store/useAuthStore";
import type { UpdateUserPayload } from "@/types/api";

const KEY = "users";

export function useMyDemandsQuery() {
  return useQuery({
    queryKey: [KEY, "my-demands"],
    queryFn: () => usersApi.myDemands(),
  });
}

export function useMyApplicationsQuery() {
  return useQuery({
    queryKey: [KEY, "my-applications"],
    queryFn: () => usersApi.myApplications(),
  });
}

export function useMyTransactionsQuery(params: QueryTransactionsParams = {}) {
  return useQuery({
    queryKey: [KEY, "my-transactions", params],
    queryFn: () => usersApi.myTransactions(params),
  });
}

export function useUpdateMeMutation() {
  const qc = useQueryClient();
  const patchUser = useAuthStore((s) => s.patchUser);
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.updateMe(payload),
    onSuccess: (user) => {
      // 同步到 auth store
      patchUser(user);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["demands", "list"] });
      qc.invalidateQueries({ queryKey: ["demands", "detail"] });
    },
  });
}
