import { Request } from "express";
import { supabase } from "../services/supabase.js";
import type { JwtUser } from "@himvirasat/shared";

export interface DialectActivityStats {
  comments_made?: number;
  comments_accepted?: number;
  comments_rejected?: number;
  comments_resolved?: number;
  [key: string]: number | undefined;
}

export interface DialectStats {
  total_comments_made?: number;
  total_comments_accepted?: number;
  total_comments_rejected?: number;
  total_comments_resolved?: number;
  by_dialect?: Record<string, DialectActivityStats>;
}

export interface DetailedUser {
  id: string;
  role: string;
  points: number;
  dialects: string[];
  username: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email?: string;
  total_points: number;
  approved_entries_count: number;
  reviews_completed_count: number;
  dialect_stats?: DialectStats;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUser | undefined;
  _cachedUser?: DetailedUser | undefined;
}

export interface StrictAuthenticatedRequest extends AuthenticatedRequest {
  user: JwtUser;
  _cachedUser: DetailedUser;
}

export interface SecurityContext {
  actor: DetailedUser;
}

export async function getAuthenticatedUser(
  req: AuthenticatedRequest
): Promise<DetailedUser | null> {
  if (req._cachedUser) {
    return req._cachedUser;
  }

  const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?.sub;
  if (!userId) return null;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        role,
        dialects,
        username,
        full_name,
        is_active,
        created_at,
        updated_at,
        user_stats (
          total_points,
          approved_contributions,
          total_reviews,
          dialect_stats
        )
      `)
      .eq("id", userId)
      .maybeSingle();

    if (error || !user) {
      if (error) console.error("[getAuthenticatedUser] Error:", error.message);
      return null;
    }

    const rawStats = Array.isArray(user.user_stats)
      ? user.user_stats[0]
      : user.user_stats;

    const formattedUser: DetailedUser = {
      id: user.id,
      role: user.role,
      points: rawStats?.total_points ?? 0,
      total_points: rawStats?.total_points ?? 0,
      dialects: Array.isArray(user.dialects) ? user.dialects : [],
      username: user.username,
      full_name: user.full_name,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      approved_entries_count: rawStats?.approved_contributions ?? 0,
      reviews_completed_count: rawStats?.total_reviews ?? 0,
      dialect_stats: (rawStats?.dialect_stats as DialectStats) ?? {},
    };

    req._cachedUser = formattedUser;
    return req._cachedUser;
  } catch (err) {
    console.error("[getAuthenticatedUser] Catch:", err);
    return null;
  }
}

export async function getAuthenticatedUserById(
  userId?: string
): Promise<DetailedUser | null> {
  if (!userId) return null;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        role,
        email,
        dialects,
        username,
        full_name,
        is_active,
        created_at,
        updated_at,
        user_stats (
          total_points,
          approved_contributions,
          total_reviews,
          dialect_stats
        )
      `)
      .eq("id", userId)
      .maybeSingle();

    if (error || !user) {
      if (error) console.error("[getAuthenticatedUserById] Error:", error.message);
      return null;
    }

    const rawStats = Array.isArray(user.user_stats)
      ? user.user_stats[0]
      : user.user_stats;

    return {
      id: user.id,
      role: user.role,
      email: user.email,
      points: rawStats?.total_points ?? 0,
      total_points: rawStats?.total_points ?? 0,
      dialects: Array.isArray(user.dialects) ? user.dialects : [],
      username: user.username,
      full_name: user.full_name,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      approved_entries_count: rawStats?.approved_contributions ?? 0,
      reviews_completed_count: rawStats?.total_reviews ?? 0,
      dialect_stats: (rawStats?.dialect_stats as DialectStats) ?? {},
    };
  } catch (err) {
    console.error("[getAuthenticatedUserById] Catch:", err);
    return null;
  }
}