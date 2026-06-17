import { API_URL } from "@/lib/constants";

export class AdminAuthService {
  static async login(username: string, password: string) {
    console.log(API_URL);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    return response.json();
  }

  static async me() {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Unauthorized");
    }

    return response.json();
  }

  static async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    return response.json();
  }
}
