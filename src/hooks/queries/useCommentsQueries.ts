import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "@/api/comments";
import type { CreateCommentPayload } from "@/types/api";

const KEY = "comments";

export function useCommentsQuery(demandId: string, enabled = true) {
  return useQuery({
    queryKey: [KEY, "demand", demandId],
    queryFn: () => commentsApi.list(demandId),
    enabled: enabled && !!demandId,
  });
}

export function useCreateCommentMutation(demandId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      commentsApi.create(demandId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "demand", demandId] });
      qc.invalidateQueries({ queryKey: ["demands", "detail", demandId] });
    },
  });
}

export function useDeleteCommentMutation(demandId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "demand", demandId] });
      qc.invalidateQueries({ queryKey: ["demands", "detail", demandId] });
    },
  });
}
