import { RequestHandler } from "express";
import { DashboardService, dashboardService } from "./dashboard.service.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
// import { AuditLogger } from "../../utils/audit-logger.js";

export class DashboardController {
  constructor(private readonly service: DashboardService = dashboardService) {}

  private getSecurityContext(req: StrictAuthenticatedRequest): SecurityContext {
    return {
      actor: req._cachedUser,
    };
  }

  getDashboardStats: RequestHandler = async (req, res): Promise<void> => {
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
      const stats = await this.service.fetchDashboardStats(ctx);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard statistics";

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "datalookup",
      //   stackTrace: error.stack,
      //   code: "FETCH_DASHBOARD_STATS_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { query: req.query, detailed_user: ctx.actor },
      // });

      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  };
}

export const dashboardController = new DashboardController();
