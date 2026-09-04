import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rechargeApi } from "@/api/recharge";
import { useAuthStore } from "@/store/useAuthStore";

const KEY = "recharge";

export function useRechargePackagesQuery() {
  return useQuery({
    queryKey: [KEY, "packages"],
    queryFn: () => rechargeApi.packages(),
    staleTime: 60_000,
  });
}

export function useRechargeMutation() {
  const qc = useQueryClient();
  const patchUser = useAuthStore((s) => s.patchUser);
  return useMutation({
    mutationFn: (packageId: string) => rechargeApi.create(packageId),
    onSuccess: (result) => {
      patchUser(result.user);
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["users", "my-transactions"] });
    },
  });
}
