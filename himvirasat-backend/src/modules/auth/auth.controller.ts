import { Request, Response } from "express";
import { LoginRequestSchema, SignupRequestSchema } from "@himvirasat/shared";
import { AuthService, authService } from "./auth.service.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
// import { AuditLogger } from "../../utils/audit-logger.js";

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  private getSecurityContext(req: StrictAuthenticatedRequest): SecurityContext {
    return {
      actor: req._cachedUser,
    };
  }

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
      // const errorMessage =
      //   error instanceof Error ? error.message : "Internal server error";

      // await AuditLogger.logError({
      //   errorMessage,
      //   serviceCategory: "auth",
      //   stackTrace: error.stack,
      //   code: "LOGIN_CRITICAL_ERROR",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { username: req.body?.username },
      // });

      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  signup = async (req: Request, res: Response) => {
    try {
      const parseResult = SignupRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message:
            parseResult.error.issues[0]?.message ?? "Invalid signup parameters",
        });
      }

      const result = await this.service.signup(parseResult.data);

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

      return res.status(201).json({
        success: true,
        message: result.message,
        user: result.user,
      });
    } catch (error: any) {
      // const errorMessage =
      //   error instanceof Error ? error.message : "Internal server error";

      // await AuditLogger.logError({
      //   userId: null,
      //   errorMessage,
      //   serviceCategory: "auth",
      //   stackTrace: error.stack,
      //   code: "SIGNUP_CRITICAL_ERROR",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { username: req.body?.username, email: req.body?.email },
      // });

      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  me = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const user = await this.service.getUserProfile(ctx);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({ success: true, user });
    } catch (error: any) {
      // const errorMessage =
      //   error instanceof Error ? error.message : "Internal server error";

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "auth",
      //   stackTrace: error.stack,
      //   code: "GET_ME_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { detailed_user: ctx.actor },
      // });

      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  logout = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    if (cachedUser) {
      // const authReq = req as StrictAuthenticatedRequest;
      // const ctx = this.getSecurityContext(authReq);
      // await AuditLogger.logActivity({
      //   actorId: ctx.actor.id,
      //   action: "LOGOUT",
      //   entityType: "user",
      //   entityId: ctx.actor.id,
      //   serviceCategory: "auth",
      //   status: "SUCCESS",
      //   metadata: { detailed_user: ctx.actor },
      // });
    }

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  };

  resetPassword = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
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
        ctx,
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
      // const errorMessage =
      //   error instanceof Error ? error.message : "Internal server error";

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "auth",
      //   stackTrace: error.stack,
      //   code: "RESET_PASSWORD_CRITICAL_ERROR",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { detailed_user: ctx.actor },
      // });

      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };
}

export const authController = new AuthController();
