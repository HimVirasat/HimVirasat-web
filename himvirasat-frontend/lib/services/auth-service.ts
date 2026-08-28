import { API_URL } from "@/lib/constants";
import { apiFetch } from "@/lib/services/api-client";

export class AuthService {
  static async login(username: string, password: string) {
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

  static async signup(payload: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    dialects?: string[];
  }) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }

  static async me() {
    const response = await apiFetch(`${API_URL}/auth/me`);

    if (!response.ok) {
      throw new Error("Unauthorized");
    }

    return response.json();
  }

  static async logout() {
    const response = await apiFetch(`${API_URL}/auth/logout`, {
      method: "POST",
    });

    return response.json();
  }

  static async resetPassword(oldPassword: string, newPassword: string) {
    const response = await apiFetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message ?? "Failed to reset password");
    }

    return result;
  }
}
