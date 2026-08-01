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
        service_category,
        status,
        backend_code,
        metadata,
        created_at
      `,
      )
      .order("created_at", { ascending: false });

    if (params.service) {
      query = query.eq("service_category", params.service);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error } = await query;
    if (error) throw error;

    return data as ActivityLog[];
  }

  async getErrorLogs(params: GetLogsParams): Promise<ErrorLog[]> {
    let query = supabase
      .from("error_logs")
      .select(
        `
        id,
        user_id,
        action,
        error_message,
        service_category,
        stack_trace,
        backend_code,
        path,
        method,
        request_id,
        status,
        metadata,
        created_at
      `,
      )
      .order("created_at", { ascending: false });

    if (params.service) {
      query = query.eq("service_category", params.service);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error } = await query;
    if (error) throw error;

    return data as ErrorLog[];
  }
}

export const dataLookupRepository = new DataLookupRepository();
