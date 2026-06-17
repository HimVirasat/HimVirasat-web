import type { LanguageExpert } from "@/types/admin/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class UserService {
  static async getLanguageExperts(): Promise<LanguageExpert[]> {
    const response = await fetch(`${API_URL}/users/language-experts`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch language experts");
    }

    const data = await response.json();
    console.log(data);
    return data.experts;
  }
}
