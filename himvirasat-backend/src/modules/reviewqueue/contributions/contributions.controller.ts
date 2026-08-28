import { Response } from "express";
import { StrictAuthenticatedRequest } from "../../../utils/get-authenticated-user.js";
import { withAuth } from "../../../middlewares/controller-handler.middleware.js";
import { AuditLogger } from "../../../utils/audit-logger.js";
import {
  ContributionsService,
  contributionsService,
} from "./contributions.service.js";
import { ContributionFiltersSchema, UpdateStatusPayloadSchema } from "@himvirasat/shared";

export class ContributionsController {
  constructor(
    private readonly service: ContributionsService = contributionsService,
  ) {}

  private getStringParam(param: unknown): string | undefined {
    if (typeof param === "string") return param;
    return undefined;
  }

  create = withAuth(
    {
      action: "CREATE_REVIEW_QUEUE",
      serviceCategory: "review_queue",
      backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_CREATE_REVIEW_QUEUE",
      failStatusCode: "400",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const data = await this.service.create(ctx, req.body);

      await AuditLogger.logActivity({
        action: "CREATE_REVIEW_QUEUE",
        entityType: "review_item",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:SUCCESS_CREATE_REVIEW_QUEUE",
        logStatus: "SUCCESS",
        metadata: { detailed_user: ctx.actor, item_id: (data as any)?.id },
      });

      res.status(201).json({ success: true, data });
    },
  );

  getList = withAuth(
    {
      action: "GET_REVIEW_QUEUE",
      serviceCategory: "review_queue",
      backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_GET_REVIEW_QUEUE",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const getStringParam = (v: unknown) =>
        typeof v === "string" ? v : undefined;

      const filterValidation = ContributionFiltersSchema.safeParse({
        status: req.query.status,
        dialect_name: getStringParam(req.query.dialect_name),
      });

      if (!filterValidation.success) {
        const errorDetails =
          filterValidation.error.issues[0]?.message ?? "Invalid filter parameters";

        await AuditLogger.logError({
          action: "GET_REVIEW_QUEUE",
          actorUserId: ctx.actor.id,
          errorMessage: errorDetails,
          serviceCategory: "review_queue",
          backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_GET_REVIEW_QUEUE",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "GET",
          metadata: { detailed_user: ctx.actor, query: req.query },
        });

        res.status(400).json({
          success: false,
          error: errorDetails,
          requestId: res.locals.requestId,
        });
        return;
      }

      const data = await this.service.fetch(ctx, filterValidation.data);
      res.status(200).json({ success: true, data });
    },
  );

  getById = withAuth(
    {
      action: "GET_REVIEW_BY_ID",
      serviceCategory: "review_queue",
      backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_GET_REVIEW_BY_ID",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const id = this.getStringParam(req.params.id);
      if (!id) {
        await AuditLogger.logError({
          action: "GET_REVIEW_BY_ID",
          actorUserId: ctx.actor.id,
          errorMessage: "Invalid or missing contribution ID",
          serviceCategory: "review_queue",
          backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_GET_REVIEW_BY_ID",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "GET",
          metadata: { detailed_user: ctx.actor, params: req.params },
        });

        res.status(400).json({
          success: false,
          error: "Invalid or missing contribution ID",
        });
        return;
      }

      const item = await this.service.fetchByIdFromContributions(ctx, id);
      if (!item) {
        await AuditLogger.logError({
          action: "GET_REVIEW_BY_ID",
          actorUserId: ctx.actor.id,
          errorMessage: "Review queue item not found",
          serviceCategory: "review_queue",
          backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_GET_REVIEW_BY_ID",
          code: "404",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "GET",
          metadata: { detailed_user: ctx.actor, target_id: id },
        });

        res.status(404).json({
          success: false,
          message: "Review queue item not found",
        });
        return;
      }
      res.status(200).json({ success: true, data: item });
    },
  );

  update = withAuth(
    {
      action: "UPDATE_REVIEW_QUEUE",
      serviceCategory: "review_queue",
      backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE",
      failStatusCode: "400",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const id = this.getStringParam(req.params.id);
      if (!id) {
        await AuditLogger.logError({
          action: "UPDATE_REVIEW_QUEUE",
          actorUserId: ctx.actor.id,
          errorMessage: "Invalid or missing contribution ID",
          serviceCategory: "review_queue",
          backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "PUT",
          metadata: { detailed_user: ctx.actor, params: req.params },
        });

        res.status(400).json({
          success: false,
          error: "Invalid or missing contribution ID",
        });
        return;
      }

      const data = await this.service.update(ctx, id, req.body);

      await AuditLogger.logActivity({
        action: "UPDATE_REVIEW_QUEUE",
        entityType: "review_item",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:SUCCESS_UPDATE_REVIEW_QUEUE",
        logStatus: "SUCCESS",
        metadata: { detailed_user: ctx.actor, target_id: id },
      });

      res.status(200).json({ success: true, data });
    },
  );

  updateStatus = withAuth(
    {
      action: "UPDATE_REVIEW_QUEUE_STATUS",
      serviceCategory: "review_queue",
      backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE_STATUS",
      failStatusCode: "400",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const parseResult = UpdateStatusPayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorDetails =
          parseResult.error.issues[0]?.message ?? "Invalid status payload";

        await AuditLogger.logError({
          action: "UPDATE_REVIEW_QUEUE_STATUS",
          actorUserId: ctx.actor.id,
          errorMessage: errorDetails,
          serviceCategory: "review_queue",
          backendCode:
            "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE_STATUS",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "PATCH",
          metadata: { detailed_user: ctx.actor, body: req.body },
        });

        res.status(400).json({ success: false, error: errorDetails });
        return;
      }

      const id = this.getStringParam(req.params.id);
      if (!id) {
        await AuditLogger.logError({
          action: "UPDATE_REVIEW_QUEUE_STATUS",
          actorUserId: ctx.actor.id,
          errorMessage: "Invalid or missing contribution ID",
          serviceCategory: "review_queue",
          backendCode:
            "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE_STATUS",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "PATCH",
          metadata: { detailed_user: ctx.actor, params: req.params },
        });

        res.status(400).json({
          success: false,
          error: "Invalid or missing contribution ID",
        });
        return;
      }

      const data = await this.service.updateStatus(ctx, id, parseResult.data);

      await AuditLogger.logActivity({
        action: "UPDATE_REVIEW_QUEUE_STATUS",
        entityType: "review_item",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "review_queue",
        backendCode:
          "REVIEW_QUEUE_CONTROLLER:SUCCESS_UPDATE_REVIEW_QUEUE_STATUS",
        logStatus: "SUCCESS",
        metadata: {
          detailed_user: ctx.actor,
          target_id: id,
          new_status: parseResult.data.status,
        },
      });

      res.status(200).json({ success: true, data });
    },
  );

  delete = withAuth(
    {
      action: "DELETE_REVIEW_QUEUE",
      serviceCategory: "review_queue",
      backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_DELETE_REVIEW_QUEUE",
      failStatusCode: "400",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const id = this.getStringParam(req.params.id);
      if (!id) {
        await AuditLogger.logError({
          action: "DELETE_REVIEW_QUEUE",
          actorUserId: ctx.actor.id,
          errorMessage: "Invalid or missing contribution ID",
          serviceCategory: "review_queue",
          backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_DELETE_REVIEW_QUEUE",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "DELETE",
          metadata: { detailed_user: ctx.actor, params: req.params },
        });

        res.status(400).json({
          success: false,
          error: "Invalid or missing contribution ID",
        });
        return;
      }

      await this.service.delete(ctx, id);

      await AuditLogger.logActivity({
        action: "DELETE_REVIEW_QUEUE",
        entityType: "review_item",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:SUCCESS_DELETE_REVIEW_QUEUE",
        logStatus: "SUCCESS",
        metadata: { detailed_user: ctx.actor, target_id: id },
      });

      res.status(200).json({
        success: true,
        message: "Review queue item deleted cleanly.",
      });
    },
  );
}

export const contributionsController = new ContributionsController();
