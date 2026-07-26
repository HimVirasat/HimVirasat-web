import { supabase } from "../../services/supabase.js";

export async function findUsersByRole(role: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, full_name, email, dialects, is_active, created_at, points")
    .eq("role", role)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function findUserByUsername(username: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createUser(userData: any) {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function softDeleteUser(id: string) {
  // Fetch current username and email
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("username, email")
    .eq("id", id)
    .single();
  if (fetchError || !user) return { success: false, statusCode: 404, message: "User not found" };

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

export async function updateUserDialects(id: string, dialects: string[]) {
  const { data, error } = await supabase
    .from("users")
    .update({ dialects })
    .eq("id", id)
    .select("id, dialects")
    .single();
  if (error) throw error;
  return data;
}