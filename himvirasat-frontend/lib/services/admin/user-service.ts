import type {
  DeleteLanguageExpertResponse,
  LanguageExpert,
} from "@/types/admin/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateLanguageExpertRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  dialects: string[];
}

export class UserService {
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
      headers: {
        "Content-Type": "application/json",
      },
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
      body: JSON.stringify({
        id: expertId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message ?? "Failed to delete language expert");
    }

    return result;
  }
}
