import { supabase } from "../../services/supabase.js";
import {
  RawContribution,
  ContributionFilters,
  InsertHistoryPayload,
  InsertCommentPayload,
} from "@himvirasat/shared";

export const CONTRIBUTION_SELECT_QUERY = `
  *,
  users:users!contributions_contributor_id_fkey(username, full_name),
  dialects:dialects!contributions_dialect_id_fkey(name),
  categories:categories!contributions_category_id_fkey(name),
  parts_of_speech:parts_of_speech!contributions_part_of_speech_id_fkey(name)
`;

export class ReviewQueueRepository {
  async insertContribution(
    data: Record<string, unknown>,
  ): Promise<RawContribution> {
    const { data: contribution, error } = await supabase
      .from("contributions")
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return contribution as RawContribution;
  }

  async fetchContributions(
    filters: ContributionFilters,
    selectQuery: string = CONTRIBUTION_SELECT_QUERY,
  ): Promise<RawContribution[]> {
    let query = supabase.from("contributions").select(selectQuery);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.dialect_id) query = query.eq("dialect_id", filters.dialect_id);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as RawContribution[];
  }

  async fetchContributionById(
    id: string,
    selectQuery: string = CONTRIBUTION_SELECT_QUERY,
  ): Promise<RawContribution | null> {
    const { data, error } = await supabase
      .from("contributions")
      .select(selectQuery)
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return (data as unknown as RawContribution) || null;
  }

  async fetchContributionRaw(id: string): Promise<RawContribution | null> {
    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return (data as RawContribution) || null;
  }

  async updateContribution(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<void> {
    const { error } = await supabase
      .from("contributions")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  }

  async deleteContribution(id: string): Promise<void> {
    const { error } = await supabase
      .from("contributions")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  // History Operations
  async insertHistory(data: InsertHistoryPayload): Promise<void> {
    const { error } = await supabase
      .from("contribution_history")
      .insert([data]);
    if (error) throw error;
  }

  async insertHistoryBatch(rows: InsertHistoryPayload[]): Promise<void> {
    if (rows.length === 0) return;
    const { error } = await supabase.from("contribution_history").insert(rows);
    if (error) throw error;
  }

  async fetchHistoryByContributionId(
    id: string,
  ): Promise<Record<string, unknown>[]> {
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

  // Comment Operations
  async insertComment(
    data: InsertCommentPayload,
  ): Promise<Record<string, unknown>> {
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

  async fetchCommentsByContributionId(
    id: string,
  ): Promise<Record<string, unknown>[]> {
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

  async updateComment(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<Record<string, unknown> | null> {
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

  async fetchCommentById(id: string): Promise<Record<string, unknown> | null> {
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
}

export const reviewQueueRepository = new ReviewQueueRepository();
