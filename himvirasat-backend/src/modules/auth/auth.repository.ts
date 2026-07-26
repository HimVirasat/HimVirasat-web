import { supabase } from "../../services/supabase.js";

export async function findUserByUsername(username: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();
  if (error || !data) return null;
  return data;
}

export async function findUserById(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data;
}

export async function updateUserPassword(id: string, passwordHash: string) {
  const { error } = await supabase
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", id);
  return !error;
}