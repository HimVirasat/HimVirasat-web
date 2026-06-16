import type {
  AdminLoginRequest,
  AdminLoginResponse,
} from "@/types/admin/admin-auth";

export class AdminAuthService {
  static async login(
    payload: AdminLoginRequest
  ): Promise<AdminLoginResponse> {
    console.log(payload);

    return {
      success: true,
      message: "Login Good",
    };
  }
}