import { useQuery } from "@tanstack/react-query";

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories/list");
      if (!res.ok) throw new Error("Erro ao buscar categorias");
      return res.json();
    },
  });
}
