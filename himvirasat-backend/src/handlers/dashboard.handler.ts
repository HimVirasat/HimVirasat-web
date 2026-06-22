import { Request, Response } from "express";

import { supabase } from "../services/supabase.js";
import { DashboardStatsDto } from "../types/user.types.js";

export async function getDashboardStats(
    _req: Request,
    res: Response
) {
    try {
        const [
            languageExpertsResult,
            languageHeadsResult,
            superAdminsResult,
        ] = await Promise.all([
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

        const stats: DashboardStatsDto = {
            languageExpertsCount: languageExpertsResult.count ?? 0,
            languageHeadsCount: languageHeadsResult.count ?? 0,
            superAdminsCount: superAdminsResult.count ?? 0,
        };

        return res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
        });
    }
}