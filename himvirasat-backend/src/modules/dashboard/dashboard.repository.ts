/**
 * Dashboard Repository
 * File: dashboard.repository.ts
 */

import { supabase } from "../../services/supabase.js";
import { DashboardStats } from "@himvirasat/shared";

export class DashboardRepository {
  async getDashboardStats(): Promise<DashboardStats> {
    const [experts, heads, admins] = await Promise.all([
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "language_expert"),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "language_head"),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "super_admin"),
    ]);

    if (experts.error) throw experts.error;
    if (heads.error) throw heads.error;
    if (admins.error) throw admins.error;

    return {
      languageExpertsCount: experts.count ?? 0,
      languageHeadsCount: heads.count ?? 0,
      superAdminsCount: admins.count ?? 0,
    };
  }
}

export const dashboardRepository = new DashboardRepository();