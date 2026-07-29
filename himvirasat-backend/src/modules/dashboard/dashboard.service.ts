/**
 * Dashboard Service
 * File: dashboard.service.ts
 */

import {
  DashboardRepository,
  dashboardRepository,
} from "./dashboard.repository.js";
import { DashboardStats } from "@himvirasat/shared";
// import { AuditLogger } from "../../utils/audit-logger.js";

export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository = dashboardRepository,
  ) {}

  async fetchDashboardStats(_actorId?: string): Promise<DashboardStats> {
    const stats = await this.repository.getDashboardStats();

    // await AuditLogger.logActivity({
    //   actorId: actorId || null,
    //   action: "FETCH_DASHBOARD_STATS",
    //   entityType: "dashboard_stats",
    //   serviceCategory: "datalookup",
    //   status: "SUCCESS",
    //   metadata: { stats },
    // });

    return stats;
  }
}

export const dashboardService = new DashboardService();