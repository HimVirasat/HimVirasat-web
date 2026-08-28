import { Response } from "express";
import { StrictAuthenticatedRequest } from "../../../utils/get-authenticated-user.js";
import { withAuth } from "../../../middlewares/controller-handler.middleware.js";
import {
  AuditLogsService,
  auditLogsService,
} from "./audit-logs.service.js";
import type { GetLogsParams } from "@himvirasat/shared";

export class AuditLogsController {
  constructor(
    private readonly service: AuditLogsService = auditLogsService,
  ) {}

  private buildLogOptions(req: StrictAuthenticatedRequest): Partial<GetLogsParams> {
    const { status, service, page, limit, startDate, endDate, hour, sort } =
      req.query;

    return {
      status: status ? (status as any) : undefined,
      service: service ? (service as any) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      hour: hour !== undefined && hour !== "" ? Number(hour) : undefined,
      sort: sort === "asc" ? "asc" : "desc",
    };
  }

  getActivityLogs = withAuth(
    {
      action: "GET_ENTRIES",
      serviceCategory: "datalookup",
      backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_ACTIVITY_LOGS",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const result = await this.service.getActivityLogs(
        ctx,
        this.buildLogOptions(req),
      );
      res.status(200).json({ success: true, data: result.data, meta: result.meta });
    },
  );

  getErrorLogs = withAuth(
    {
      action: "GET_ENTRIES",
      serviceCategory: "datalookup",
      backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_ERROR_LOGS",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const result = await this.service.getErrorLogs(
        ctx,
        this.buildLogOptions(req),
      );
      res.status(200).json({ success: true, data: result.data, meta: result.meta });
    },
  );
}

export const auditLogsController = new AuditLogsController();
