import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "@/api/applications";
import type { ApplicationStatus, CreateApplicationPayload, UpdateApplicationPayload } from "@/types/api";

const KEY = "applications";

export function useMyApplicationsQuery(status?: ApplicationStatus) {
  return useQuery({
    queryKey: [KEY, "my", status ?? "all"],
    queryFn: () => applicationsApi.myList(status),
  });
}

export function useDemandApplicationsQuery(demandId: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, "demand", demandId],
    queryFn: () => applicationsApi.listByDemand(demandId),
    enabled: enabled && !!demandId,
  });
}

export function useCreateApplicationMutation(demandId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApplicationPayload = {}) =>
      applicationsApi.create(demandId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "my"] });
      qc.invalidateQueries({ queryKey: ["demands", "detail", demandId] });
    },
  });
}

export function useUpdateApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateApplicationPayload }) =>
      applicationsApi.update(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      // 完成订单后相关需求详情需重新拉
      qc.invalidateQueries({ queryKey: ["demands", "detail"] });
      qc.invalidateQueries({ queryKey: ["users", "my-applications"] });
      qc.invalidateQueries({ queryKey: ["users", "my-demands"] });
      // vars.demandId 不可直接拿到，让列表级 cache 失效
      void vars.id;
    },
  });
}

export function useCancelApplicationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "my"] });
    },
  });
}
