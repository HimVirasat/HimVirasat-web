import type { LanguageExpert } from "@/types/admin/user";

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
    // console.log(API_URL);
    const response = await fetch(`${API_URL}/users/language-experts`, {
      credentials: "include",
    });
    // console.log(response);
    if (!response.ok) {
      throw new Error("Failed to fetch language experts");
    }

    const data = await response.json();
    // console.log(data);
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
}
