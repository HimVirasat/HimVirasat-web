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
    const queryParams = new URLSearchParams();
    if (params.status && (params.status as string) !== "ALL") {
      queryParams.append("status", params.status);
    }
    if (params.service && (params.service as string) !== "ALL") {
      queryParams.append("service", params.service);
    }
    if (params.page !== undefined) {
      queryParams.append("page", String(params.page));
    }
    if (params.limit !== undefined) {
      queryParams.append("limit", String(params.limit));
    }

    const response = await fetch(
      `${API_URL}/datalookup/logs/activity?${queryParams.toString()}`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch activity logs");
    }

    const result = await response.json();
    return {
      data: result.data || [],
      meta: result.meta || {
        total: 0,
        totalPages: 1,
        totalSuccess: 0,
        totalFailed: 0,
      },
    };
  }

  static async getErrorLogs(
    params: GetLogsParams
  ): Promise<PaginatedLogsResponse<ErrorLog>> {
    const queryParams = new URLSearchParams();
    if (params.status && (params.status as string) !== "ALL") {
      queryParams.append("status", params.status);
    }
    if (params.service && (params.service as string) !== "ALL") {
      queryParams.append("service", params.service);
    }
    if (params.page !== undefined) {
      queryParams.append("page", String(params.page));
    }
    if (params.limit !== undefined) {
      queryParams.append("limit", String(params.limit));
    }

    const response = await fetch(
      `${API_URL}/datalookup/logs/error?${queryParams.toString()}`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch error logs");
    }

    const result = await response.json();
    return {
      data: result.data || [],
      meta: result.meta || {
        total: 0,
        totalPages: 1,
        totalCritical: 0,
        totalStandard: 0,
      },
    };
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
