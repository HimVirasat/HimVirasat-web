import {
  DataLookupRepository,
  dataLookupRepository,
} from "../datalookup.repository.js";
import {
  ActivityLog,
  ErrorLog,
  GetLogsParams,
} from "@himvirasat/shared";
import { SecurityContext } from "../../../utils/get-authenticated-user.js";

export interface PaginatedLogsResponse<T> {
  data: T[];
  meta: {
    total: number;
    totalPages: number;
    totalSuccess?: number | undefined;
    totalFailed?: number | undefined;
    totalCritical?: number | undefined;
    totalStandard?: number | undefined;
  };
}

type FetchLogsOptions = Partial<GetLogsParams>;

export class AuditLogsService {
  constructor(
    private readonly repository: DataLookupRepository = dataLookupRepository,
  ) {}

  async getActivityLogs(
    _ctx: SecurityContext,
    options: FetchLogsOptions = {},
  ): Promise<PaginatedLogsResponse<ActivityLog>> {
    const params = this.normalizeLogOptions(options);
    const result = await this.repository.getActivityLogs(params);

    return {
      data: result.data,
      meta: {
        total: result.total,
        totalPages: this.getTotalPages(result.total, params.limit),
        totalSuccess: result.totalSuccess ?? 0,
        totalFailed: result.totalFailed ?? 0,
      },
    };
  }

  async getErrorLogs(
    _ctx: SecurityContext,
    options: FetchLogsOptions = {},
  ): Promise<PaginatedLogsResponse<ErrorLog>> {
    const params = this.normalizeLogOptions(options);
    const result = await this.repository.getErrorLogs(params);

    return {
      data: result.data,
      meta: {
        total: result.total,
        totalPages: this.getTotalPages(result.total, params.limit),
        totalCritical: result.totalCritical ?? 0,
        totalStandard: result.totalStandard ?? 0,
      },
    };
  }

  private normalizeLogOptions(options: FetchLogsOptions): GetLogsParams {
    return {
      service: options.service,
      status: options.status,
      page: this.normalizePositiveInteger(options.page, 1),
      limit: this.normalizePositiveInteger(options.limit, 20, 100),
      startDate: options.startDate,
      endDate: options.endDate,
      hour: options.hour,
      sort: options.sort ?? "desc",
    };
  }

  private normalizePositiveInteger(
    value: number | undefined,
    fallback: number,
    max?: number,
  ): number {
    if (value === undefined || !Number.isInteger(value) || value < 1) {
      return fallback;
    }

    return max === undefined ? value : Math.min(value, max);
  }

  private getTotalPages(total: number, limit: number): number {
    return Math.max(1, Math.ceil(total / limit));
  }
}

export const auditLogsService = new AuditLogsService();
