import { useSupabaseAuth } from "@/features/auth/provider";

export function useAuthSession() {
  return useSupabaseAuth();
}
