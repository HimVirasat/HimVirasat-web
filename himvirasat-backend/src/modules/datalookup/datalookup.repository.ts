import { supabase } from "../../services/supabase.js";
import { ActivityLog, ErrorLog, GetLogsParams } from "@himvirasat/shared";

export interface DynamicLookupOption {
  id: number;
  name: string;
}

export class DataLookupRepository {
  async getDialects(): Promise<DynamicLookupOption[]> {
    const { data, error } = await supabase
      .from("dialects")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getCategories(): Promise<DynamicLookupOption[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getPartsOfSpeech(): Promise<DynamicLookupOption[]> {
    const { data, error } = await supabase
      .from("parts_of_speech")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getAvailableRegions(): Promise<DynamicLookupOption[]> {
    const { data, error } = await supabase
      .from("regions")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getActivityLogs(params: GetLogsParams): Promise<ActivityLog[]> {
    let query = supabase
      .from("activity_logs")
      .select(
        `
        id,
        actor_id,
        action,
        entity_type,
        entity_id,
        service_category,
        status,
        metadata,
        created_at,
        users:actor_id ( full_name )
      `,
      )
      .order("created_at", { ascending: false });

    if (params.service && params.service !== "ALL") {
      query = query.eq("service_category", params.service);
    }

    if (params.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      actor_id: row.actor_id,
      actor_name: row.users?.full_name || "System",
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      service_category: row.service_category,
      status: row.status,
      metadata: row.metadata || {},
      created_at: row.created_at,
    }));
  }

  async getErrorLogs(params: GetLogsParams): Promise<ErrorLog[]> {
    let query = supabase
      .from("error_logs")
      .select(
        `
        id,
        user_id,
        error_message,
        service_category,
        stack_trace,
        code,
        path,
        method,
        request_id,
        metadata,
        status,
        created_at,
        users:user_id ( full_name )
      `,
      )
      .order("created_at", { ascending: false });

    if (params.service && params.service !== "ALL") {
      query = query.eq("service_category", params.service);
    }

    if (params.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      user_name: row.users?.full_name || "System",
      error_message: row.error_message,
      service_category: row.service_category,
      stack_trace: row.stack_trace,
      code: row.code,
      path: row.path,
      method: row.method,
      request_id: row.request_id,
      metadata: row.metadata || {},
      status: row.status,
      created_at: row.created_at,
    }));
  }
}

export const dataLookupRepository = new DataLookupRepository();