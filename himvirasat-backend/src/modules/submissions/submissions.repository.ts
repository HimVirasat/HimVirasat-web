import { supabase } from "../../services/supabase.js";

export async function insertContribution(data: any) {
  const { data: contribution, error } = await supabase
    .from("contributions")
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return contribution;
}

export async function insertHistory(data: any) {
  const { error } = await supabase
    .from("contribution_history")
    .insert([data]);
  if (error) throw error;
}