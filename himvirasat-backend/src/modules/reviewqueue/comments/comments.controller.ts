import { Response } from "express";
import { StrictAuthenticatedRequest } from "../../../utils/get-authenticated-user.js";
import { withAuth } from "../../../middlewares/controller-handler.middleware.js";
import { AuditLogger } from "../../../utils/audit-logger.js";
import {
  CommentsService,
  commentsService,
} from "./comments.service.js";
import {
  AddCommentPayloadSchema,
  UpdateCommentStatusPayloadSchema,
} from "@himvirasat/shared";

export class CommentsController {
  constructor(
    private readonly service: CommentsService = commentsService,
  ) {}

  private getStringParam(param: unknown): string | undefined {
    if (typeof param === "string") return param;
    return undefined;
  }

  add = withAuth(
    {
      action: "ADD_REVIEW_QUEUE_COMMENT",
      serviceCategory: "review_queue",
      backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_ADD_REVIEW_QUEUE_COMMENT",
      failStatusCode: "400",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const parseResult = AddCommentPayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorDetails =
          parseResult.error.issues[0]?.message ?? "Invalid comment payload";

        await AuditLogger.logError({
          action: "ADD_REVIEW_QUEUE_COMMENT",
          actorUserId: ctx.actor.id,
          errorMessage: errorDetails,
          serviceCategory: "review_queue",
          backendCode:
            "REVIEW_QUEUE_CONTROLLER:FAILED_ADD_REVIEW_QUEUE_COMMENT",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "POST",
          metadata: { detailed_user: ctx.actor, body: req.body },
        });

        res.status(400).json({ success: false, error: errorDetails });
        return;
      }

      const id = this.getStringParam(req.params.id);
      if (!id) {
        await AuditLogger.logError({
          action: "ADD_REVIEW_QUEUE_COMMENT",
          actorUserId: ctx.actor.id,
          errorMessage: "Invalid or missing contribution ID",
          serviceCategory: "review_queue",
          backendCode:
            "REVIEW_QUEUE_CONTROLLER:FAILED_ADD_REVIEW_QUEUE_COMMENT",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "POST",
          metadata: { detailed_user: ctx.actor, params: req.params },
        });

        res.status(400).json({
          success: false,
          error: "Invalid or missing contribution ID",
        });
        return;
      }

      const { field_name, message } = parseResult.data;
      const cleanFieldName =
        field_name && field_name.trim() !== "" ? field_name.trim() : "General";

      const comment = await this.service.add(ctx, id, {
        field_name: cleanFieldName,
        message,
      });

      await AuditLogger.logActivity({
        action: "ADD_REVIEW_QUEUE_COMMENT",
        entityType: "review_item",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:SUCCESS_ADD_REVIEW_QUEUE_COMMENT",
        logStatus: "SUCCESS",
        metadata: {
          detailed_user: ctx.actor,
          target_id: id,
          comment_id: String(comment?.id),
        },
      });

      res.status(201).json({ success: true, data: comment });
    },
  );

  updateStatus = withAuth(
    {
      action: "UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
      serviceCategory: "review_queue",
      backendCode:
        "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
      failStatusCode: "400",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const parseResult = UpdateCommentStatusPayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorDetails =
          parseResult.error.issues[0]?.message ??
          "Invalid comment status payload";

        await AuditLogger.logError({
          action: "UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
          actorUserId: ctx.actor.id,
          errorMessage: errorDetails,
          serviceCategory: "review_queue",
          backendCode:
            "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "PATCH",
          metadata: { detailed_user: ctx.actor, body: req.body },
        });

        res.status(400).json({ success: false, error: errorDetails });
        return;
      }

      const commentId = this.getStringParam(req.params.commentId);
      if (!commentId) {
        await AuditLogger.logError({
          action: "UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
          actorUserId: ctx.actor.id,
          errorMessage: "Invalid or missing comment ID",
          serviceCategory: "review_queue",
          backendCode:
            "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
          code: "400",
          logStatus: "FAILED",
          path: req.originalUrl || req.path,
          method: "PATCH",
          metadata: { detailed_user: ctx.actor, params: req.params },
        });

        res.status(400).json({
          success: false,
          error: "Invalid or missing comment ID",
        });
        return;
      }

      const data = await this.service.updateStatus(
        ctx,
        commentId,
        parseResult.data,
      );

      await AuditLogger.logActivity({
        action: "UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
        entityType: "review_item",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "review_queue",
        backendCode:
          "REVIEW_QUEUE_CONTROLLER:SUCCESS_UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
        logStatus: "SUCCESS",
        metadata: {
          detailed_user: ctx.actor,
          comment_id: commentId,
          status: parseResult.data.status,
        },
      });

      res.status(200).json({ success: true, data });
    },
  );
}

export const commentsController = new CommentsController();
