import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { testimonialsApi } from "@/api/testimonials";
import type { CreateTestimonialPayload } from "@/types/api";

const KEY = "testimonials";

export function useTestimonialsQuery() {
  return useQuery({
    queryKey: [KEY, "list"],
    queryFn: () => testimonialsApi.list(),
  });
}

export function useCreateTestimonialMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTestimonialPayload) =>
      testimonialsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
