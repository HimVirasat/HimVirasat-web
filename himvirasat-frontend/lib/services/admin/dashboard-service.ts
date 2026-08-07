import { API_URL } from "@/lib/constants";
import {
  DashboardFetchUsersResponse,
  DashboardFetchUsersResponseSchema,
  SystemRole,
  UserProfileWithStats,
} from "@himvirasat/shared";

export class DashboardService {
  /**
   * Fetches list of users grouped by their system role (super_admin, language_head, language_expert).
   */
  static async getUsersByRole(
    role: SystemRole,
  ): Promise<DashboardFetchUsersResponse> {
    const response = await fetch(
      `${API_URL}/dashboard/users?role=${encodeURIComponent(role)}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to fetch users by role");
    }

    // Validates payload runtime contract against Zod schema
    return DashboardFetchUsersResponseSchema.parse(result.data);
  }

  /**
   * Fetches the active logged-in user's profile along with user_stats.
   */
  static async getMyProfile(): Promise<UserProfileWithStats> {
    const response = await fetch(`${API_URL}/dashboard/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to fetch user profile");
    }

    return result.data;
  }
}