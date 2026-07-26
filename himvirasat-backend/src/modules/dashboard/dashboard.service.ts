import { supabase } from "../../services/supabase.js";

export async function fetchDashboardStats() {
  const [experts, heads, admins] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "language_expert"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "language_head"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "super_admin"),
  ]);
  return {
    languageExpertsCount: experts.count ?? 0,
    languageHeadsCount: heads.count ?? 0,
    superAdminsCount: admins.count ?? 0,
  };
}