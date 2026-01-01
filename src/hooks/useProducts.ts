import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Product } from "@/types";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data as Product[];
    },
  });
};