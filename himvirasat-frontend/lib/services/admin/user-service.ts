import type {
  DeleteLanguageExpertResponse,
  LanguageExpert,
  LanguageHead,
} from "@/types/admin/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateLanguageExpertRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  dialects: string[];
}

export interface CreateLanguageHeadRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  dialects: string[];
}

export class UserService {
  // --- LANGUAGE EXPERTS ---
  static async getLanguageExperts(): Promise<LanguageExpert[]> {
    const response = await fetch(`${API_URL}/users/language-experts`, {
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message ?? "Failed to fetch language experts");
    }
    return data.experts;
  }

  static async createLanguageExpert(data: CreateLanguageExpertRequest) {
    const response = await fetch(`${API_URL}/users/language-experts`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message ?? "Failed to create language expert");
    }
    return json;
  }

  static async deleteLanguageExpert(
    expertId: string
  ): Promise<DeleteLanguageExpertResponse> {
    const response = await fetch(`${API_URL}/users/delete-expert`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: expertId }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Return detailed backend message or fall back to generic
      throw new Error(
        result.message ||
        `Delete failed (${response.status}): User likely has assigned reviews or system references.`
      );
    }

    return result;
  }
  static async getLanguageHeads(): Promise<LanguageHead[]> {
    const response = await fetch(`${API_URL}/users/language-heads`, {
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message ?? "Failed to fetch language heads");
    }
    return data.heads ?? data.users ?? [];
  }

  static async createLanguageHead(data: CreateLanguageHeadRequest) {
    const response = await fetch(`${API_URL}/users/language-heads`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message ?? "Failed to create language head");
    }
    return json;
  }

  static async deleteLanguageHead(
    headId: string
  ): Promise<DeleteLanguageExpertResponse> {
    const response = await fetch(`${API_URL}/users/delete-head`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: headId }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message ?? "Failed to delete language head");
    }
    return result;
  }
  static async updateExpertDialects(id: string, dialects: string[]) {
    const response = await fetch(`${API_URL}/users/language-experts/dialects`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, dialects }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message ?? "Failed to update expert dialects");
    }
    return result;
  }

  static async updateHeadDialects(id: string, dialects: string[]) {
    const response = await fetch(`${API_URL}/users/language-heads/dialects`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, dialects }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message ?? "Failed to update language head dialects");
    }
    return result;
  }
}