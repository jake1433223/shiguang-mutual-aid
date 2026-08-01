import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { demandsApi } from "@/api/demands";
import type { CreateDemandPayload, QueryDemandsParams } from "@/types/api";

const KEY = "demands";

export function useDemandsQuery(params: QueryDemandsParams) {
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => demandsApi.list(params),
    placeholderData: (prev) => prev, // 翻页时保留旧数据避免闪烁
  });
}

export function useDemandQuery(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => demandsApi.detail(id),
    enabled: options.enabled ?? true,
  });
}

export function useCreateDemandMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDemandPayload) => demandsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "list"] });
      qc.invalidateQueries({ queryKey: ["users", "my-demands"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteDemandMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => demandsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "list"] });
      qc.invalidateQueries({ queryKey: ["users", "my-demands"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
