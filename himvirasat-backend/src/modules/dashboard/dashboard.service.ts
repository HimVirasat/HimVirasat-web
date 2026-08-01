import {
  DashboardRepository,
  dashboardRepository,
} from "./dashboard.repository.js";
import { DashboardStats } from "@himvirasat/shared";
// import { AuditLogger } from "../../utils/audit-logger.js";
import { SecurityContext } from "../../utils/get-authenticated-user.js";

export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository = dashboardRepository,
  ) {}

  async fetchDashboardStats(ctx: SecurityContext): Promise<DashboardStats> {
    const stats = await this.repository.getDashboardStats();

    // await AuditLogger.logActivity({
    //   actorId: ctx.actor.id,
    //   action: "FETCH_DASHBOARD_STATS",
    //   entityType: "dashboard_stats",
    //   serviceCategory: "datalookup",
    //   status: "SUCCESS",
    //   metadata: { stats, detailed_user: ctx.actor },
    // });

    return stats;
  }
}

export const dashboardService = new DashboardService();
