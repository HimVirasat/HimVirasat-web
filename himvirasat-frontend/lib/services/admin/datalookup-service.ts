import { ActivityLog, ErrorLog, GetLogsParams } from "@himvirasat/shared";
import { API_URL } from "@/lib/constants";

export interface GenerateMetadataPayload {
  word_devanagari: string;
  meaning_hindi?: string;
  meaning_english?: string;
  example_sentence?: string;
}

export interface GeneratedMetadataResult {
  word_latin?: string;
  word_takri?: string;
  ipa?: string;
  example_sentence_latin?: string;
  example_sentence_takri?: string;
}

export interface PaginatedLogsResponse<T> {
  data: T[];
  meta: {
    total: number;
    totalPages: number;
    totalSuccess?: number;
    totalFailed?: number;
    totalCritical?: number;
    totalStandard?: number;
  };
}

type LogResponseMeta = PaginatedLogsResponse<ActivityLog | ErrorLog>["meta"];

const buildLogsQuery = (params: GetLogsParams): string => {
  const queryParams = new URLSearchParams();
  const appendIfPresent = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === "") return;
    if (value === "ALL") return;
    queryParams.append(key, String(value));
  };

  appendIfPresent("status", params.status);
  appendIfPresent("service", params.service);
  appendIfPresent("page", params.page);
  appendIfPresent("limit", params.limit);
  appendIfPresent("startDate", params.startDate);
  appendIfPresent("endDate", params.endDate);
  appendIfPresent("hour", params.hour);
  appendIfPresent("sort", params.sort);

  return queryParams.toString();
};

const withLogDefaults = <T>(
  result: { data?: T[]; meta?: LogResponseMeta },
  fallbackMeta: LogResponseMeta
): PaginatedLogsResponse<T> => ({
  data: result.data || [],
  meta: {
    ...fallbackMeta,
    ...result.meta,
  },
});

export class DataLookupService {
  static async getAvailableDialects(): Promise<string[]> {
    const response = await fetch(`${API_URL}/datalookup/available-dialects`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available dialects");
    }

    const result = await response.json();
    return result.data;
  }
  static async getUserDialects(identifier: string): Promise<string[]> {
    const response = await fetch(`${API_URL}/users/${identifier}/dialects`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user dialects");
    }

    const result = await response.json();
    return result.data?.dialects || [];
  }

  static async getAvailablePartsOfSpeech(): Promise<string[]> {
    const response = await fetch(`${API_URL}/datalookup/available-pos`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available parts of speech");
    }

    const result = await response.json();
    return result.data;
  }

  static async getAvailableCategories(): Promise<string[]> {
    const response = await fetch(`${API_URL}/datalookup/available-categories`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available categories");
    }

    const result = await response.json();
    return result.data;
  }

  static async getAvailableRegions(): Promise<string[]> {
    const response = await fetch(`${API_URL}/datalookup/available-regions`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch available regions");
    }
    const result = await response.json();
    return result.data;
  }

  static async getActivityLogs(
    params: GetLogsParams
  ): Promise<PaginatedLogsResponse<ActivityLog>> {
    const query = buildLogsQuery(params);

    const response = await fetch(
      `${API_URL}/datalookup/logs/activity${query ? `?${query}` : ""}`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch activity logs");
    }

    const result = await response.json();
    return withLogDefaults<ActivityLog>(result, {
      total: 0,
      totalPages: 1,
      totalSuccess: 0,
      totalFailed: 0,
    });
  }

  static async getErrorLogs(
    params: GetLogsParams
  ): Promise<PaginatedLogsResponse<ErrorLog>> {
    const query = buildLogsQuery(params);

    const response = await fetch(
      `${API_URL}/datalookup/logs/error${query ? `?${query}` : ""}`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch error logs");
    }

    const result = await response.json();
    return withLogDefaults<ErrorLog>(result, {
      total: 0,
      totalPages: 1,
      totalCritical: 0,
      totalStandard: 0,
    });
  }

  static async generateMetadata(
    payload: GenerateMetadataPayload
  ): Promise<GeneratedMetadataResult> {
    const response = await fetch(`${API_URL}/datalookup/generate-metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to generate metadata");
    }

    return result.data;
  }
}
