import { Request } from "express";
import { supabase } from "../services/supabase.js";
import type { JwtUser } from "@himvirasat/shared";

// Define shape of the user record returned from Supabase
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
  total_reviews: number;
  total_contributions: number;
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
  req: AuthenticatedRequest,
): Promise<DetailedUser | null> {
  if (req._cachedUser) {
    return req._cachedUser;
  }

  const userId = req.user?.userId;
  if (!userId) return null;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(
        "id, role, points, dialects, username, full_name, is_active, created_at, updated_at, total_reviews, total_contributions",
      )
      .eq("id", userId)
      .single();

    if (error || !user) return null;

    req._cachedUser = user as DetailedUser;

    return req._cachedUser;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUserById(userId?: string) {
  if (!userId) return null;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(
        "id, role, email, points, dialects, username, full_name, is_active, created_at, updated_at, total_reviews, total_contributions",
      )
      .eq("id", userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
