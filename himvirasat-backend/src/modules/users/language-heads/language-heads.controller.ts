import { Response } from "express";
import { StrictAuthenticatedRequest } from "../../../utils/get-authenticated-user.js";
import { withAuth } from "../../../middlewares/controller-handler.middleware.js";
import { AuditLogger } from "../../../utils/audit-logger.js";
import {
  LanguageHeadsService,
  languageHeadsService,
} from "./language-heads.service.js";

export class LanguageHeadsController {
  constructor(
    private readonly service: LanguageHeadsService = languageHeadsService,
  ) {}

  getLanguageHeads = withAuth(
    {
      action: "FETCH_LANGUAGE_HEADS",
      serviceCategory: "users",
      backendCode: "USER_CONTROLLER:FAILED_FETCH_LANGUAGE_HEADS",
    },
    async (ctx, _req: StrictAuthenticatedRequest, res: Response) => {
      const heads = await this.service.fetch(ctx);
      res.json({ success: true, heads });
    },
  );

  createLanguageHead = withAuth(
    {
      action: "CREATE_LANGUAGE_HEAD",
      serviceCategory: "users",
      backendCode: "USER_CONTROLLER:FAILED_CREATE_LANGUAGE_HEAD",
      failStatusCode: "500",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const result = await this.service.create(ctx, req.body);
      if (!result.success) {
        const failureMessage =
          result.message ?? "Failed to create language head";

        await AuditLogger.logError({
          action: "CREATE_LANGUAGE_HEAD",
          actorUserId: ctx.actor.id,
          errorMessage: failureMessage,
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_CREATE_LANGUAGE_HEAD",
          code: (String(result.statusCode ?? 500) as any),
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "POST",
          metadata: { detailed_user: ctx.actor, body: req.body },
        });

        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }

      await AuditLogger.logActivity({
        action: "CREATE_LANGUAGE_HEAD",
        entityType: "user",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "users",
        backendCode: "USER_CONTROLLER:SUCCESS_CREATE_LANGUAGE_HEAD",
        logStatus: "SUCCESS",
        metadata: { detailed_user: ctx.actor, created_head: result.head },
      });

      res.status(201).json({
        success: true,
        message: "Language head created successfully",
        head: result.head,
      });
    },
  );

  deleteLanguageHead = withAuth(
    {
      action: "DELETE_LANGUAGE_HEAD",
      serviceCategory: "users",
      backendCode: "USER_CONTROLLER:FAILED_DELETE_LANGUAGE_HEAD",
      failStatusCode: "500",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const { id } = req.body;
      if (!id) {
        await AuditLogger.logError({
          action: "DELETE_LANGUAGE_HEAD",
          actorUserId: ctx.actor.id,
          errorMessage: "User ID is required",
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_DELETE_LANGUAGE_HEAD",
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
          result.message ??
          "An unknown error occurred while trying to delete language head";

        await AuditLogger.logError({
          action: "DELETE_LANGUAGE_HEAD",
          actorUserId: ctx.actor.id,
          errorMessage: failureMessage,
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_DELETE_LANGUAGE_HEAD",
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
        action: "DELETE_LANGUAGE_HEAD",
        entityType: "user",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "users",
        backendCode: "USER_CONTROLLER:SUCCESS_DELETE_LANGUAGE_HEAD",
        logStatus: "SUCCESS",
        metadata: { detailed_user: ctx.actor, deleted_id: id },
      });

      res.status(200).json({
        success: true,
        message: "Language head deactivated",
        deleted_id: id,
      });
    },
  );

  updateHeadDialects = withAuth(
    {
      action: "UPDATE_HEAD_DIALECTS",
      serviceCategory: "users",
      backendCode: "USER_CONTROLLER:FAILED_UPDATE_HEAD_DIALECTS",
      failStatusCode: "500",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const { id, dialects } = req.body;
      if (!id || !Array.isArray(dialects)) {
        await AuditLogger.logError({
          action: "UPDATE_HEAD_DIALECTS",
          actorUserId: ctx.actor.id,
          errorMessage: "User ID and dialects array are required",
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_UPDATE_HEAD_DIALECTS",
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
          result.message ?? "Failed to update managed dialects";

        await AuditLogger.logError({
          action: "UPDATE_HEAD_DIALECTS",
          actorUserId: ctx.actor.id,
          errorMessage: failureMessage,
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_UPDATE_HEAD_DIALECTS",
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
        action: "UPDATE_HEAD_DIALECTS",
        entityType: "user",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "users",
        backendCode: "USER_CONTROLLER:SUCCESS_UPDATE_HEAD_DIALECTS",
        logStatus: "SUCCESS",
        metadata: {
          detailed_user: ctx.actor,
          target_id: id,
          updated_head: result.data,
        },
      });

      res.status(200).json({
        success: true,
        message: "Head dialects updated",
        head: result.data,
      });
    },
  );
}

export const languageHeadsController = new LanguageHeadsController();
