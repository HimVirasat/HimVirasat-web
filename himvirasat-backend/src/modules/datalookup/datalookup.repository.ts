import { supabase } from "../../services/supabase.js";
import { ActivityLog, ErrorLog, GetLogsParams } from "@himvirasat/shared";

export interface DynamicLookupOption {
  id: number;
  name: string;
}
export interface PaginatedQueryResult<T> {
  data: T[];
  total: number;
  totalSuccess?: number;
  totalFailed?: number;
  totalCritical?: number;
  totalStandard?: number;
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

  // Add type for repository return payload if needed
  async getActivityLogs(
    params: GetLogsParams,
  ): Promise<PaginatedQueryResult<ActivityLog>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 1. Fetch Paginated Records and Total Count
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
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (params.service) {
      query = query.eq("service_category", params.service);
    }
    if (params.status) {
      query = query.eq("status", params.status);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    // 2. Compute Success / Failed counts across the entire dataset (respecting service filter if present)
    let countSuccessQuery = supabase
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("status", "SUCCESS");

    let countFailedQuery = supabase
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("status", "FAILED");

    if (params.service) {
      countSuccessQuery = countSuccessQuery.eq(
        "service_category",
        params.service,
      );
      countFailedQuery = countFailedQuery.eq(
        "service_category",
        params.service,
      );
    }

    const [{ count: successCount }, { count: failedCount }] = await Promise.all(
      [countSuccessQuery, countFailedQuery],
    );

    return {
      data: (data as ActivityLog[]) || [],
      total: count ?? 0,
      totalSuccess: successCount ?? 0,
      totalFailed: failedCount ?? 0,
    };
  }

  async getErrorLogs(
    params: GetLogsParams,
  ): Promise<PaginatedQueryResult<ErrorLog>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 1. Fetch Paginated Records and Total Count
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
        created_at,
        code
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (params.service) {
      query = query.eq("service_category", params.service);
    }
    if (params.status) {
      query = query.eq("status", params.status);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    // 2. Compute Critical (5xx) vs Standard errors count across dataset
    let criticalQuery = supabase
      .from("error_logs")
      .select("id", { count: "exact", head: true })
      .or("code.eq.500,code.eq.501,code.eq.502,code.eq.503,code.like.5%");

    let standardQuery = supabase
      .from("error_logs")
      .select("id", { count: "exact", head: true })
      .not("code", "like", "5%");

    if (params.service) {
      criticalQuery = criticalQuery.eq("service_category", params.service);
      standardQuery = standardQuery.eq("service_category", params.service);
    }

    const [{ count: criticalCount }, { count: standardCount }] =
      await Promise.all([criticalQuery, standardQuery]);

    return {
      data: (data as ErrorLog[]) || [],
      total: count ?? 0,
      totalCritical: criticalCount ?? 0,
      totalStandard: standardCount ?? 0,
    };
  }
}

export const dataLookupRepository = new DataLookupRepository();
