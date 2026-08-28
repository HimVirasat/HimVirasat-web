import { Response } from "express";
import {
  StrictAuthenticatedRequest,
} from "../../../utils/get-authenticated-user.js";
import { withAuth } from "../../../middlewares/controller-handler.middleware.js";
import { AuditLogger } from "../../../utils/audit-logger.js";
import {
  LanguageExpertsService,
  languageExpertsService,
} from "./language-experts.service.js";

export class LanguageExpertsController {
  constructor(
    private readonly service: LanguageExpertsService = languageExpertsService,
  ) {}

  getLanguageExperts = withAuth(
    {
      action: "FETCH_LANGUAGE_EXPERT",
      serviceCategory: "users",
      backendCode: "USER_CONTROLLER:FAILED_FETCH_LANGUAGE_EXPERT",
    },
    async (ctx, _req: StrictAuthenticatedRequest, res: Response) => {
      const experts = await this.service.fetch(ctx);
      res.json({ success: true, experts });
    },
  );

  createLanguageExpert = withAuth(
    {
      action: "CREATE_LANGUAGE_EXPERT",
      serviceCategory: "users",
      backendCode: "USER_CONTROLLER:FAILED_CREATE_LANGUAGE_EXPERT",
      failStatusCode: "500",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const result = await this.service.create(ctx, req.body);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }

      await AuditLogger.logActivity({
        action: "CREATE_LANGUAGE_EXPERT",
        entityType: "user",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "users",
        backendCode: "USER_CONTROLLER:SUCCESS_CREATE_LANGUAGE_EXPERT",
        logStatus: "SUCCESS",
        metadata: { detailed_user: ctx.actor, created_expert: result.expert },
      });

      res.status(201).json({
        success: true,
        message: "Language expert created successfully",
        expert: result.expert,
      });
    },
  );

  deleteLanguageExpert = withAuth(
    {
      action: "DELETE_LANGUAGE_EXPERT",
      serviceCategory: "users",
      backendCode: "USER_CONTROLLER:FAILED_DELETE_LANGUAGE_EXPERT",
      failStatusCode: "500",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const { id } = req.body;
      if (!id) {
        await AuditLogger.logError({
          action: "DELETE_LANGUAGE_EXPERT",
          actorUserId: ctx.actor.id,
          errorMessage: "User ID is required",
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_DELETE_LANGUAGE_EXPERT",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "DELETE",
          metadata: { detailed_user: ctx.actor },
        });

        res
          .status(400)
          .json({ success: false, message: "User ID is required" });
        return;
      }

      const result = await this.service.delete(ctx, id);
      if (!result.success) {
        const failureMessage =
          result.message ?? "Failed to delete language expert";

        await AuditLogger.logError({
          action: "DELETE_LANGUAGE_EXPERT",
          actorUserId: ctx.actor.id,
          errorMessage: failureMessage,
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_DELETE_LANGUAGE_EXPERT",
          code: (String(result.statusCode ?? 500) as any),
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "DELETE",
          metadata: { detailed_user: ctx.actor, target_id: id },
        });

        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }

      await AuditLogger.logActivity({
        action: "DELETE_LANGUAGE_EXPERT",
        entityType: "user",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "users",
        backendCode: "USER_CONTROLLER:SUCCESS_DELETE_LANGUAGE_EXPERT",
        logStatus: "SUCCESS",
        metadata: { detailed_user: ctx.actor, deleted_id: id },
      });

      res.status(200).json({
        success: true,
        message: "Language expert deactivated",
        deleted_id: id,
      });
    },
  );

  updateExpertDialects = withAuth(
    {
      action: "UPDATE_EXPERT_DIALECTS",
      serviceCategory: "users",
      backendCode: "USER_CONTROLLER:FAILED_UPDATE_EXPERT_DIALECTS",
      failStatusCode: "500",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const { id, dialects } = req.body;
      if (!id || !Array.isArray(dialects)) {
        await AuditLogger.logError({
          action: "UPDATE_EXPERT_DIALECTS",
          actorUserId: ctx.actor.id,
          errorMessage: "User ID and dialects array are required",
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_UPDATE_EXPERT_DIALECTS",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "PATCH",
          metadata: { detailed_user: ctx.actor, body: req.body },
        });

        res.status(400).json({
          success: false,
          message: "User ID and dialects array are required",
        });
        return;
      }

      const result = await this.service.updateDialects(ctx, id, dialects);
      if (!result.success) {
        const failureMessage =
          result.message ??
          "Unknown error occurred while trying to update expert dialects";

        await AuditLogger.logError({
          action: "UPDATE_EXPERT_DIALECTS",
          actorUserId: ctx.actor.id,
          errorMessage: failureMessage,
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_UPDATE_EXPERT_DIALECTS",
          code: (String(result.statusCode ?? 500) as any),
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "PATCH",
          metadata: {
            detailed_user: ctx.actor,
            target_id: id,
            new_dialects: dialects,
          },
        });

        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }

      await AuditLogger.logActivity({
        action: "UPDATE_EXPERT_DIALECTS",
        entityType: "user",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "users",
        backendCode: "USER_CONTROLLER:SUCCESS_UPDATE_EXPERT_DIALECTS",
        logStatus: "SUCCESS",
        metadata: {
          detailed_user: ctx.actor,
          target_id: id,
          updated_expert: result.data,
        },
      });

      res.status(200).json({
        success: true,
        message: "Expert dialects updated",
        expert: result.data,
      });
    },
  );
}

export const languageExpertsController = new LanguageExpertsController();
