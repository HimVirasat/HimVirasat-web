import { API_URL } from "@/lib/constants";
import { DashboardStats } from "@/types/admin/dashboard";

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_URL}/dashboard`, {
      credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }

    return result.data;
  }
}
