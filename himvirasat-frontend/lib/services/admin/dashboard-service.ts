import { API_URL } from "@/lib/constants";
import { DashboardStatsDto } from "@himvirasat/shared";
import { resolve } from "node:dns";

export class DashboardService {
  static async getStats(): Promise<DashboardStatsDto> {
    const response = await fetch(`${API_URL}/dashboard`, {
      credentials: "include",
    });
    const result = await response.json();
    console.log(result.message);
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }

    return result.data;
  }
}
