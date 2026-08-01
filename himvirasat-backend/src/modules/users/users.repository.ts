import { supabase } from "../../services/supabase.js";
import {
  UserRow,
  CreateUserPayloadBackend,
  SoftDeleteResult,
  AwardPointsPayload,
} from "@himvirasat/shared";
import { logger } from "../../utils/logger.js";

export class UsersRepository {
  async findUsersByRole(role: string): Promise<Partial<UserRow>[]> {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, username, full_name, email, dialects, is_active, created_at, points",
      )
      .eq("role", role)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Partial<UserRow>[];
  }

  async findUserByUsername(username: string): Promise<{ id: string } | null> {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createUser(userData: CreateUserPayloadBackend): Promise<UserRow> {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data as UserRow;
  }

  async softDeleteUser(id: string): Promise<SoftDeleteResult> {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("username, email")
      .eq("id", id)
      .single();

    if (fetchError || !user) {
      return { success: false, statusCode: 404, message: "User not found" };
    }

    const timestamp = Date.now();
    const anonymizedUsername = `deleted_hv_${timestamp}`;
    const anonymizedEmail = `deleted_${timestamp}_${user.email}`;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_active: false,
        username: anonymizedUsername,
        email: anonymizedEmail,
      })
      .eq("id", id);

    if (updateError) throw updateError;
    return { success: true };
  }

  async updateUserDialects(
    id: string,
    dialects: string[],
  ): Promise<{ id: string; dialects: string[] } | null> {
    const { data, error } = await supabase
      .from("users")
      .update({ dialects })
      .eq("id", id)
      .select("id, dialects")
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return (data as { id: string; dialects: string[] }) || null;
  }

  async awardPoints(payload: AwardPointsPayload): Promise<boolean> {
    const { userId, points, reason, referenceId, dialectId, isContributor } =
      payload;

    const { data, error } = await supabase.rpc("award_points_rpc", {
      p_user_id: userId,
      p_points: points,
      p_reason: reason,
      p_reference_id: referenceId,
      p_dialect_id: dialectId ?? null,
      p_is_contributor: isContributor,
    });

    if (error) {
      logger.error("Error awarding points:", error);
      throw error;
    }

    return Boolean(data);
  }
}

export const usersRepository = new UsersRepository();
