import { RequestHandler } from "express";
import { DashboardService, dashboardService } from "./dashboard.service.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
import { AuditLogger } from "../../utils/audit-logger.js";
import { METHODS, SystemRole, SystemRoleSchema } from "@himvirasat/shared";

export class DashboardController {
  constructor(private readonly service: DashboardService = dashboardService) { }

  private getSecurityContext(req: StrictAuthenticatedRequest): SecurityContext {
    return {
      actor: req._cachedUser,
    };
  }

  getUsersByRole: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    // Validate query param against SystemRoleSchema
    const roleParam = req.query.role as string;
    const parsedRole = SystemRoleSchema.safeParse(roleParam);

    if (!parsedRole.success) {
      res.status(400).json({
        success: false,
        error: "Invalid or missing 'role' query parameter.",
      });
      return;
    }

    try {
      const data = await this.service.fetchUsersByRole(ctx, parsedRole.data as SystemRole);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch users by role";

      await AuditLogger.logError({
        action: "GET_DASHBOARD_USERS_BY_ROLE",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "dashboard",
        backendCode: "DASHBOARD_CONTROLLER:FAILED_GET_DASHBOARD_USERS_BY_ROLE",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: req.method as METHODS,
        metadata: { query: req.query, detailed_user: ctx.actor },
      });

      res.status(500).json({ success: false, error: errorMessage });
    }
  };

  // dashboard.controller.ts
  getMyProfile: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const profile = await this.service.fetchMyProfile(ctx);
      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      // LOG TO DEV TERMINAL FOR IMMEDIATE VISIBILITY
      console.error("GET /dashboard/me failed:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch profile";

      await AuditLogger.logError({
        action: "GET_MY_PROFILE",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "dashboard",
        backendCode: "DASHBOARD_CONTROLLER:FAILED_GET_MY_PROFILE",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: req.method as METHODS,
        metadata: { detailed_user: ctx.actor },
      });

      res.status(500).json({ success: false, error: errorMessage });
    }
  };
}

export const dashboardController = new DashboardController();