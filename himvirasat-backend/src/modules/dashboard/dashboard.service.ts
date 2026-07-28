import {
  DashboardRepository,
  dashboardRepository,
} from "./dashboard.repository.js";
import { DashboardStats } from "@himvirasat/shared";
export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository = dashboardRepository
  ) {}

  async fetchDashboardStats(): Promise<DashboardStats> {
    return await this.repository.getDashboardStats();
  }
}

export const dashboardService = new DashboardService();