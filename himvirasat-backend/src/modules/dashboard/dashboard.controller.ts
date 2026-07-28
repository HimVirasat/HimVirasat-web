import { Request, Response } from "express";
import { DashboardService, dashboardService } from "./dashboard.service.js";

export class DashboardController {
  constructor(
    private readonly service: DashboardService = dashboardService
  ) {}

  getDashboardStats = async (_req: Request, res: Response) => {
    try {
      const stats = await this.service.fetchDashboardStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error("Dashboard Controller [getDashboardStats] error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
      });
    }
  };
}

export const dashboardController = new DashboardController();