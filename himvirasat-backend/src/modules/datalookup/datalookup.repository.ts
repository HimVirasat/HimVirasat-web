import { supabase } from "../../services/supabase.js";
import { ActivityLog, ErrorLog, GetLogsParams } from "@himvirasat/shared";

export interface DynamicLookupOption {
  id: number | string;
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
  async getDialects(): Promise<string[]> {
    const { data, error } = await supabase
      .from("dialects")
      .select("name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map((dialect) => dialect.name);
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

    const ascending = params.sort === "asc";

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
      .order("created_at", { ascending });

    if (params.service) {
      query = query.eq("service_category", params.service);
    }
    if (params.status) {
      query = query.eq("status", params.status);
    }
    if (params.startDate) {
      query = query.gte("created_at", params.startDate);
    }
    if (params.endDate) {
      query = query.lte("created_at", params.endDate);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    // Compute counts respecting date filters
    let countSuccessQuery = supabase
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("status", "SUCCESS");

    let countFailedQuery = supabase
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("status", "FAILED");

    if (params.service) {
      countSuccessQuery = countSuccessQuery.eq("service_category", params.service);
      countFailedQuery = countFailedQuery.eq("service_category", params.service);
    }
    if (params.startDate) {
      countSuccessQuery = countSuccessQuery.gte("created_at", params.startDate);
      countFailedQuery = countFailedQuery.gte("created_at", params.startDate);
    }
    if (params.endDate) {
      countSuccessQuery = countSuccessQuery.lte("created_at", params.endDate);
      countFailedQuery = countFailedQuery.lte("created_at", params.endDate);
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

    const ascending = params.sort === "asc";

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
      .order("created_at", { ascending });

    if (params.service) {
      query = query.eq("service_category", params.service);
    }
    if (params.status) {
      query = query.eq("status", params.status);
    }
    if (params.startDate) {
      query = query.gte("created_at", params.startDate);
    }
    if (params.endDate) {
      query = query.lte("created_at", params.endDate);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

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
    if (params.startDate) {
      criticalQuery = criticalQuery.gte("created_at", params.startDate);
      standardQuery = standardQuery.gte("created_at", params.startDate);
    }
    if (params.endDate) {
      criticalQuery = criticalQuery.lte("created_at", params.endDate);
      standardQuery = standardQuery.lte("created_at", params.endDate);
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
