import { Request } from "express";
import { supabase } from "../services/supabase.js";
import type { JwtUser, SystemRole } from "@himvirasat/shared";

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
  clerk_user_id?: string | null;
  role: SystemRole;
  points: number;
  dialects: string[];
  username: string;
  full_name: string;
  email?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

type RawUserRow = {
  id: string;
  clerk_user_id?: string | null;
  role: SystemRole;
  email?: string | null;
  dialects?: unknown;
  username: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_stats?: unknown;
};

function formatDetailedUser(user: RawUserRow): DetailedUser {
  const rawStats = Array.isArray(user.user_stats)
    ? (user.user_stats[0] as
        | {
            total_points?: number | null;
            approved_contributions?: number | null;
            total_reviews?: number | null;
            dialect_stats?: unknown;
          }
        | undefined)
    : (user.user_stats as
        | {
            total_points?: number | null;
            approved_contributions?: number | null;
            total_reviews?: number | null;
            dialect_stats?: unknown;
          }
        | undefined);

  return {
    id: user.id,
    clerk_user_id: user.clerk_user_id ?? null,
    role: user.role,
    email: user.email ?? null,
    points: rawStats?.total_points ?? 0,
    total_points: rawStats?.total_points ?? 0,
    dialects: Array.isArray(user.dialects) ? (user.dialects as string[]) : [],
    username: user.username,
    full_name: user.full_name,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
    approved_entries_count: rawStats?.approved_contributions ?? 0,
    reviews_completed_count: rawStats?.total_reviews ?? 0,
    dialect_stats: (rawStats?.dialect_stats as DialectStats) ?? {},
  };
}

const USER_SELECT_QUERY = `
  id,
  clerk_user_id,
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
`;

async function fetchDetailedUser(
  column: "id" | "clerk_user_id",
  value: string,
): Promise<DetailedUser | null> {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(USER_SELECT_QUERY)
      .eq(column, value)
      .maybeSingle();

    if (error || !user) {
      if (error) console.error("[fetchDetailedUser] Error:", error.message);
      return null;
    }

    return formatDetailedUser(user as RawUserRow);
  } catch (err) {
    console.error("[fetchDetailedUser] Catch:", err);
    return null;
  }
}

export async function getAuthenticatedUser(
  req: AuthenticatedRequest
): Promise<DetailedUser | null> {
  if (req._cachedUser) {
    return req._cachedUser;
  }

  const userId = req.user?.userId;
  if (!userId) return null;

  const formattedUser = await fetchDetailedUser("id", userId);
  if (formattedUser) {
    req._cachedUser = formattedUser;
  }
  return formattedUser;
}

export async function getAuthenticatedUserById(
  userId?: string
): Promise<DetailedUser | null> {
  if (!userId) return null;
  return fetchDetailedUser("id", userId);
}
