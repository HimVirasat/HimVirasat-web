import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/lib/services/auth-service";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const data = await AuthService.me();
        // Your backend returns { success: true, user: { ... } }
        return data.user || null;
      } catch (error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Keep cache active for 5 mins
    retry: false, // Don't spam backend if 401
  });
}
