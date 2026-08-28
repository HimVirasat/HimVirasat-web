import { supabase } from "../../services/supabase.js";
import { DashboardFetchUsersResponse, SystemRole, UserProfileWithStats } from "@himvirasat/shared";


export class DashboardRepository {
  /**
   * Fetches users belonging to a specific system role.
   */
  async getUsersByRole(role: SystemRole): Promise<DashboardFetchUsersResponse> {
    const { data, count, error } = await supabase
      .from("users")
      .select("id, username, full_name, dialects", { count: "exact" })
      .eq("role", role);

    if (error) {
      console.error("Error in getUsersByRole:", error);
      throw error;
    }

    const formattedUsers = (data || []).map((u) => ({
      id: u.id,
      userName: u.username || "",
      fullName: u.full_name || "",
      dialects: Array.isArray(u.dialects) ? u.dialects : [],
    }));

    return {
      role,
      totalCount: count ?? 0,
      users: formattedUsers,
    };
  }

  /**
   * Fetches the user profile joined with user_stats metrics.
   */
  async getUserProfileWithStats(userId: string): Promise<UserProfileWithStats> {
    // 1. Fetch user record using 'username' column
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username, full_name, email, role, dialects")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user in getUserProfileWithStats:", userError);
      throw userError;
    }

    // 2. Fetch stats safely with maybeSingle()
    const { data: stats, error: statsError } = await supabase
      .from("user_stats")
      .select("total_points, approved_contributions, total_reviews")
      .eq("user_id", userId)
      .maybeSingle();

    if (statsError) {
      console.error("Error fetching user_stats in getUserProfileWithStats:", statsError);
    }

    return {
      id: user.id,
      userName: user.username || "",
      fullName: user.full_name || "",
      email: user.email || "",
      role: user.role as SystemRole,
      dialects: Array.isArray(user.dialects) ? user.dialects : [],
      stats: {
        totalPoints: stats?.total_points ?? 0,
        approvedEntriesCount: stats?.approved_contributions ?? 0,
        reviewsCompletedCount: stats?.total_reviews ?? 0,
      },
    };
  }
}

export const dashboardRepository = new DashboardRepository();