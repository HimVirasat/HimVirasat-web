import {
  DashboardRepository,
  dashboardRepository,
} from "./dashboard.repository.js";
import { DashboardStats } from "@himvirasat/shared";
import { SecurityContext } from "../../utils/get-authenticated-user.js";

export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository = dashboardRepository,
  ) {}

  async fetchDashboardStats(_ctx: SecurityContext): Promise<DashboardStats> {
    const stats = await this.repository.getDashboardStats();
    return stats;
  }
}

export const dashboardService = new DashboardService();
