import { supabase } from "../../services/supabase.js";

// ------------------------------------------------------------------
// Contributions
// ------------------------------------------------------------------
export async function insertContribution(data: any) {
  const { data: contribution, error } = await supabase
    .from("contributions")
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return contribution;
}

export async function fetchContributions(
  filters: { status?: string | undefined; dialect_id?: number | undefined },
  selectQuery: string,
) {
  let query = supabase.from("contributions").select(selectQuery);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.dialect_id) query = query.eq("dialect_id", filters.dialect_id);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchContributionById(id: string, selectQuery: string) {
  const { data, error } = await supabase
    .from("contributions")
    .select(selectQuery)
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data || null;
}

export async function fetchContributionRaw(id: string) {
  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function updateContribution(id: string, updates: any) {
  const { error } = await supabase
    .from("contributions")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteContribution(id: string) {
  const { error } = await supabase.from("contributions").delete().eq("id", id);
  if (error) throw error;
}

// ------------------------------------------------------------------
// History
// ------------------------------------------------------------------
export async function insertHistory(data: any) {
  const { error } = await supabase.from("contribution_history").insert([data]);
  if (error) throw error;
}

export async function insertHistoryBatch(rows: any[]) {
  if (rows.length === 0) return;
  const { error } = await supabase.from("contribution_history").insert(rows);
  if (error) throw error;
}

export async function fetchHistoryByContributionId(id: string) {
  const { data, error } = await supabase
    .from("contribution_history")
    .select(
      `*, users:users!contribution_history_actor_id_fkey(username, full_name)`,
    )
    .eq("contribution_id", id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ------------------------------------------------------------------
// Comments
// ------------------------------------------------------------------
export async function insertComment(data: any) {
  const { data: comment, error } = await supabase
    .from("contribution_comments")
    .insert([data])
    .select(
      `*, users:users!contribution_comments_author_id_fkey(username, full_name)`,
    )
    .single();
  if (error) throw error;
  return comment;
}

export async function fetchCommentsByContributionId(id: string) {
  const { data, error } = await supabase
    .from("contribution_comments")
    .select(
      `*, users:users!contribution_comments_author_id_fkey(username, full_name)`,
    )
    .eq("contribution_id", id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateComment(id: string, updates: any) {
  const { data, error } = await supabase
    .from("contribution_comments")
    .update(updates)
    .eq("id", id)
    .select(
      `*, users:users!contribution_comments_author_id_fkey(username, full_name)`,
    )
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function fetchCommentById(id: string) {
  const { data, error } = await supabase
    .from("contribution_comments")
    .select(
      `*, users:users!contribution_comments_author_id_fkey(username, full_name)`,
    )
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}
