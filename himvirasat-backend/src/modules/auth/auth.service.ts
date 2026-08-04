import bcrypt from "bcrypt";
import { AuthRepository, authRepository } from "./auth.repository.js";
import { generateToken } from "../../utils/jwt.js";
import type { LoginResponse, SignupRequest, UserDto } from "@himvirasat/shared";
import { AuditLogger } from "../../utils/audit-logger.js";
import { SecurityContext } from "../../utils/get-authenticated-user.js";

export class AuthService {
  constructor(private readonly repository: AuthRepository = authRepository) {}

  async login(
    username: string,
    password: string,
  ): Promise<LoginResponse & { token?: string; statusCode?: number }> {
    const user = await this.repository.findByUsername(username);

    if (!user) {
      await AuditLogger.logActivity({
        action: "LOGIN",
        entityType: "user",
        actorUserId: null,
        backendModuleCategory: "auth",
        backendCode: "AUTH_SERVICE:FAILED_LOGIN",
        logStatus: "FAILED",
        metadata: { username, reason: "User not found" },
      });

      return {
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
      };
    }

    if (!user.is_active) {
      await AuditLogger.logActivity({
        action: "LOGIN",
        entityType: "user",
        actorUserId: user.id,
        backendModuleCategory: "auth",
        backendCode: "AUTH_SERVICE:FAILED_LOGIN",
        logStatus: "FAILED",
        metadata: { target_id: user.id, username, reason: "Account disabled" },
      });

      return {
        success: false,
        statusCode: 403,
        message: "Account is disabled",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      await AuditLogger.logActivity({
        action: "LOGIN",
        entityType: "user",
        actorUserId: user.id,
        backendModuleCategory: "auth",
        backendCode: "AUTH_SERVICE:FAILED_LOGIN",
        logStatus: "FAILED",
        metadata: { target_id: user.id, username, reason: "Invalid password" },
      });

      return {
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
      };
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const userDto: UserDto = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      dialects: user.dialects,
    };

    await AuditLogger.logActivity({
      action: "LOGIN",
      entityType: "user",
      actorUserId: user.id,
      backendModuleCategory: "auth",
      backendCode: "AUTH_SERVICE:SUCCESS_LOGIN",
      logStatus: "SUCCESS",
      metadata: {
        target_id: user.id,
        username: user.username,
        role: user.role,
      },
    });

    return {
      success: true,
      message: "Login successful",
      token,
      user: userDto,
    };
  }

  async signup(
    payload: SignupRequest,
  ): Promise<LoginResponse & { token?: string; statusCode?: number }> {
    const existingUsername = await this.repository.findByUsername(
      payload.username,
    );

    if (existingUsername) {
      return {
        success: false,
        statusCode: 409,
        message: "Username already exists",
      };
    }

    const existingEmail = await this.repository.findByEmail(payload.email);

    if (existingEmail) {
      return {
        success: false,
        statusCode: 409,
        message: "Email already exists",
      };
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await this.repository.createUser({
      username: payload.username,
      password_hash: passwordHash,
      full_name: payload.fullName,
      email: payload.email,
      role: "contributor",
      dialects: payload.dialects ?? [],
    });

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const userDto: UserDto = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      dialects: user.dialects,
    };

    await AuditLogger.logActivity({
      action: "SIGNUP",
      entityType: "user",
      actorUserId: user.id,
      backendModuleCategory: "auth",
      backendCode: "AUTH_SERVICE:SUCCESS_SIGNUP",
      logStatus: "SUCCESS",
      metadata: {
        target_id: user.id,
        username: user.username,
        role: user.role,
      },
    });

    return {
      success: true,
      message: "Signup successful",
      token,
      user: userDto,
    };
  }

  async getUserProfile(ctx: SecurityContext): Promise<UserDto | null> {
    const user = await this.repository.findById(ctx.actor.id);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      dialects: user.dialects,
    };
  }

  async resetPassword(
    ctx: SecurityContext,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message?: string; statusCode?: number }> {
    const user = await this.repository.findById(ctx.actor.id);
    if (!user) {
      return { success: false, statusCode: 404, message: "User not found" };
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password_hash,
    );
    if (!isPasswordValid) {
      await AuditLogger.logActivity({
        action: "RESET_PASSWORD",
        entityType: "user",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "auth",
        backendCode: "AUTH_SERVICE:FAILED_RESET_PASSWORD",
        logStatus: "FAILED",
        metadata: {
          target_id: ctx.actor.id,
          reason: "Incorrect current password",
          detailed_user: ctx.actor,
        },
      });

      return {
        success: false,
        statusCode: 400,
        message: "Incorrect current password",
      };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const isUpdated = await this.repository.updatePassword(
      ctx.actor.id,
      hashedNewPassword,
    );

    if (!isUpdated) {
      await AuditLogger.logActivity({
        action: "RESET_PASSWORD",
        entityType: "user",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "auth",
        backendCode: "AUTH_SERVICE:FAILED_RESET_PASSWORD",
        logStatus: "FAILED",
        metadata: {
          target_id: ctx.actor.id,
          reason: "Database update failed",
          detailed_user: ctx.actor,
        },
      });

      return {
        success: false,
        statusCode: 500,
        message: "Failed to update password",
      };
    }

    await AuditLogger.logActivity({
      action: "RESET_PASSWORD",
      entityType: "user",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "auth",
      backendCode: "AUTH_SERVICE:SUCCESS_RESET_PASSWORD",
      logStatus: "SUCCESS",
      metadata: { target_id: ctx.actor.id, detailed_user: ctx.actor },
    });

    return { success: true, message: "Password reset successfully" };
  }
}

export const authService = new AuthService();
