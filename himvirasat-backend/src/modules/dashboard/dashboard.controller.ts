/**
 * Dashboard Controller
 * File: dashboard.controller.ts
 */

import { RequestHandler } from "express";
import { DashboardService, dashboardService } from "./dashboard.service.js";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { AuditLogger } from "../../utils/audit-logger.js";

export class DashboardController {
  constructor(private readonly service: DashboardService = dashboardService) {}

  getDashboardStats: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actorId = authReq.user?.userId;

    try {
      const stats = await this.service.fetchDashboardStats(actorId);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch dashboard statistics";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "datalookup",
        stackTrace: error.stack,
        code: "FETCH_DASHBOARD_STATS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { query: req.query },
      });

      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  };
}

export const dashboardController = new DashboardController();