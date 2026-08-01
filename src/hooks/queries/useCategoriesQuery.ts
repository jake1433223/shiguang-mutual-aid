import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/api/categories";

const KEY = "categories";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: [KEY, "list"],
    queryFn: () => categoriesApi.list(),
  });
}
