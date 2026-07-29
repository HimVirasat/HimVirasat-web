/**
 * Auth Controller
 * File: auth.controller.ts
 */

import { Request, Response } from "express";
import { LoginRequestSchema } from "@himvirasat/shared";
import { AuthService, authService } from "./auth.service.js";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { AuditLogger } from "../../utils/audit-logger.js";

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  login = async (req: Request, res: Response) => {
    try {
      const parseResult = LoginRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message:
            parseResult.error.issues[0]?.message ?? "Invalid login parameters",
        });
      }

      const { username, password } = parseResult.data;
      const result = await this.service.login(username, password);

      if (!result.success || !result.token) {
        return res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
      }

      res.cookie("access_token", result.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        user: result.user,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      await AuditLogger.logError({
        userId: null,
        errorMessage,
        serviceCategory: "auth",
        stackTrace: error.stack,
        code: "LOGIN_CRITICAL_ERROR",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { username: req.body?.username },
      });

      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  me = async (req: Request, res: Response) => {
    const authUser = (req as AuthenticatedRequest).user;
    const actorId = authUser?.userId;

    try {
      if (!authUser) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const user = await this.service.getUserProfile(authUser.userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({ success: true, user });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "auth",
        stackTrace: error.stack,
        code: "GET_ME_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
      });

      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  logout = async (req: Request, res: Response) => {
    const authUser = (req as AuthenticatedRequest).user;
    const actorId = authUser?.userId;

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    if (actorId) {
      await AuditLogger.logActivity({
        actorId,
        action: "LOGOUT",
        entityType: "user",
        entityId: actorId,
        serviceCategory: "auth",
        status: "SUCCESS",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  };

  resetPassword = async (req: Request, res: Response) => {
    const authUser = (req as AuthenticatedRequest).user;
    const actorId = authUser?.userId;

    try {
      if (!authUser) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Old password and new password are required",
        });
      }

      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }

      const result = await this.service.resetPassword(
        authUser.userId,
        oldPassword,
        newPassword,
      );

      if (!result.success) {
        return res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
      }

      return res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "auth",
        stackTrace: error.stack,
        code: "RESET_PASSWORD_CRITICAL_ERROR",
        path: req.originalUrl || req.path,
        method: req.method,
      });

      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };
}

export const authController = new AuthController();