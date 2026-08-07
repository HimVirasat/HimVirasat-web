import {
  DashboardRepository,
  dashboardRepository,
  
} from "./dashboard.repository.js";
import {UserProfileWithStats} from "@himvirasat/shared"
import { DashboardFetchUsersResponse, SystemRole } from "@himvirasat/shared";
import { SecurityContext } from "../../utils/get-authenticated-user.js";

export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository = dashboardRepository,
  ) {}

  async fetchUsersByRole(
    _ctx: SecurityContext,
    role: SystemRole,
  ): Promise<DashboardFetchUsersResponse> {
    return await this.repository.getUsersByRole(role);
  }

  async fetchMyProfile(ctx: SecurityContext): Promise<UserProfileWithStats> {
    return await this.repository.getUserProfileWithStats(ctx.actor.id);
  }
}

export const dashboardService = new DashboardService();