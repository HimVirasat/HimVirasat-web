import { supabase } from "../../services/supabase.js";
import type { CreateUserPayloadBackend, UserRecord } from "@himvirasat/shared";

export class AuthRepository {
  async findByClerkUserId(clerkUserId: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserRecord;
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) return null;
    return data as UserRecord;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserRecord;
  }

  async createUser(userData: CreateUserPayloadBackend): Promise<UserRecord> {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data as UserRecord;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as UserRecord;
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const { error } = await supabase
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("id", id);

    return !error;
  }

  async updateUser(
    id: string,
    updates: Partial<
      Pick<
        UserRecord,
        | "clerk_user_id"
        | "username"
        | "full_name"
        | "email"
        | "role"
        | "dialects"
        | "is_active"
        | "last_signed_in_at"
      >
    >,
  ): Promise<UserRecord> {
    const { data, error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as UserRecord;
  }
}

export const authRepository = new AuthRepository();
