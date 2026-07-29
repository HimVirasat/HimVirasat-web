/**
 * Auth Service
 * File: auth.service.ts
 */

import bcrypt from "bcrypt";
import { AuthRepository, authRepository } from "./auth.repository.js";
import { generateToken } from "../../utils/jwt.js";
import type { UserDto, LoginResponse } from "@himvirasat/shared";
import { AuditLogger } from "../../utils/audit-logger.js";

export class AuthService {
  constructor(private readonly repository: AuthRepository = authRepository) { }

  async login(
    username: string,
    password: string,
  ): Promise<LoginResponse & { token?: string; statusCode?: number }> {
    const user = await this.repository.findByUsername(username);

    if (!user) {
      await AuditLogger.logActivity({
        actorId: null,
        action: "LOGIN_FAILED",
        entityType: "user",
        serviceCategory: "auth",
        status: "FAILED",
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
        actorId: user.id,
        action: "LOGIN_FAILED",
        entityType: "user",
        entityId: user.id,
        serviceCategory: "auth",
        status: "FAILED",
        metadata: { username, reason: "Account disabled" },
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
        actorId: user.id,
        action: "LOGIN_FAILED",
        entityType: "user",
        entityId: user.id,
        serviceCategory: "auth",
        status: "FAILED",
        metadata: { username, reason: "Invalid password" },
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
      actorId: user.id,
      action: "LOGIN_SUCCESS",
      entityType: "user",
      entityId: user.id,
      serviceCategory: "auth",
      status: "SUCCESS",
      metadata: { username: user.username, role: user.role },
    });

    return {
      success: true,
      message: "Login successful",
      token,
      user: userDto,
    };
  }

  async getUserProfile(userId: string): Promise<UserDto | null> {
    const user = await this.repository.findById(userId);
    if (!user) return null;

    // await AuditLogger.logActivity({
    //   actorId: userId,
    //   action: "GET_USER_PROFILE",
    //   entityType: "user",
    //   entityId: userId,
    //   serviceCategory: "auth",
    //   status: "SUCCESS",
    // });

    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      dialects: user.dialects,
    };
  }

  async resetPassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message?: string; statusCode?: number }> {
    const user = await this.repository.findById(userId);
    if (!user) {
      return { success: false, statusCode: 404, message: "User not found" };
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password_hash,
    );
    if (!isPasswordValid) {
      await AuditLogger.logActivity({
        actorId: userId,
        action: "RESET_PASSWORD_FAILED",
        entityType: "user",
        entityId: userId,
        serviceCategory: "auth",
        status: "FAILED",
        metadata: { reason: "Incorrect current password" },
      });

      return {
        success: false,
        statusCode: 400,
        message: "Incorrect current password",
      };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const isUpdated = await this.repository.updatePassword(
      userId,
      hashedNewPassword,
    );

    if (!isUpdated) {
      await AuditLogger.logActivity({
        actorId: userId,
        action: "RESET_PASSWORD_FAILED",
        entityType: "user",
        entityId: userId,
        serviceCategory: "auth",
        status: "FAILED",
        metadata: { reason: "Database update failed" },
      });

      return {
        success: false,
        statusCode: 500,
        message: "Failed to update password",
      };
    }

    await AuditLogger.logActivity({
      actorId: userId,
      action: "RESET_PASSWORD_SUCCESS",
      entityType: "user",
      entityId: userId,
      serviceCategory: "auth",
      status: "SUCCESS",
    });

    return { success: true, message: "Password reset successfully" };
  }
}

export const authService = new AuthService();