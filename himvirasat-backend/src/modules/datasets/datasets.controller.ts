import { Request, Response } from "express";
import { DatasetsService, datasetsService } from "./datasets.service.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
// import { AuditLogger } from "../../utils/audit-logger.js";

export class DatasetsController {
  constructor(private readonly service: DatasetsService = datasetsService) {}

  private getSecurityContext(req: StrictAuthenticatedRequest): SecurityContext {
    return {
      actor: req._cachedUser,
    };
  }

  getEntries = async (req: Request, res: Response): Promise<Response> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const result = await this.service.getEntries(ctx, req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to retrieve dataset entries";

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "dataset",
      //   stackTrace: error.stack,
      //   code: "FETCH_DATASET_ENTRIES_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { query: req.query, detailed_user: ctx.actor },
      // });

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  };

  getEntryById = async (req: Request, res: Response): Promise<Response> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const { id } = req.params;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing ID parameter",
        });
      }

      const entry = await this.service.getEntryById(ctx, id);
      return res.status(200).json({
        success: true,
        data: entry,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to retrieve dataset entry";

      const statusCode = errorMessage === "Dataset entry not found" ? 404 : 500;

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "dataset",
      //   stackTrace: error.stack,
      //   code: "FETCH_DATASET_ENTRY_BY_ID_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { params: req.params, detailed_user: ctx.actor },
      // });

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  };
}

export const datasetsController = new DatasetsController();
