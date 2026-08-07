import { RequestHandler } from "express";
import {
  ReviewQueueService,
  reviewQueueService,
} from "./reviewqueue.service.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
import {
  ContributionFiltersSchema,
  UpdateStatusPayloadSchema,
  AddCommentPayloadSchema,
  UpdateCommentStatusPayloadSchema,
} from "@himvirasat/shared";
import { AuditLogger } from "../../utils/audit-logger.js";

export class ReviewQueueController {
  constructor(
    private readonly service: ReviewQueueService = reviewQueueService,
  ) {}

  private getSecurityContext(req: StrictAuthenticatedRequest): SecurityContext {
    return {
      actor: req._cachedUser,
    };
  }

  private getStringParam(param: unknown): string | undefined {
    if (typeof param === "string") return param;
    return undefined;
  }

  createReviewQueue: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const data = await this.service.createContribution(ctx, req.body);

      await AuditLogger.logActivity({
        action: "CREATE_REVIEW_QUEUE",
        entityType: "review_item",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:SUCCESS_CREATE_REVIEW_QUEUE",
        logStatus: "SUCCESS",
        metadata: { detailed_user: ctx.actor, item_id: data?.id },
      });

      res.status(201).json({ success: true, data });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error creating item";

      await AuditLogger.logError({
        action: "CREATE_REVIEW_QUEUE",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_CREATE_REVIEW_QUEUE",
        code: "400",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "POST",
        metadata: { detailed_user: ctx.actor, body: req.body },
      });

      res.status(400).json({ success: false, error: errorMessage });
    }
  };

  getReviewQueue: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const filterValidation = ContributionFiltersSchema.safeParse({
        status: req.query.status,
        dialect_name: this.getStringParam(req.query.dialect_name),
      });

      if (!filterValidation.success) {
        const errorDetails =
          filterValidation.error.issues[0]?.message ??
          "Invalid filter parameters";

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

      const data = await this.service.fetchContributions(
        ctx,
        filterValidation.data,
      );

      // await AuditLogger.logActivity({
      //   action: "GET_REVIEW_QUEUE",
      //   entityType: "review_item",
      //   actorUserId: ctx.actor.id,
      //   backendModuleCategory: "review_queue",
      //   backendCode: "REVIEW_QUEUE_CONTROLLER:SUCCESS_GET_REVIEW_QUEUE",
      //   logStatus: "SUCCESS",
      //   metadata: { detailed_user: ctx.actor, filters: filterValidation.data },
      // });

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error fetching items";

      await AuditLogger.logError({
        action: "GET_REVIEW_QUEUE",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_GET_REVIEW_QUEUE",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "GET",
        metadata: { detailed_user: ctx.actor, query: req.query },
      });

      res.status(500).json({ success: false, error: errorMessage });
    }
  };

  getReviewQueueById: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
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

      const item = await this.service.fetchContributionById(ctx, id);
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

        res
          .status(404)
          .json({ success: false, message: "Review queue item not found" });
        return;
      }
      res.status(200).json({ success: true, data: item });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error fetching item";

      await AuditLogger.logError({
        action: "GET_REVIEW_BY_ID",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_GET_REVIEW_BY_ID",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "GET",
        metadata: { detailed_user: ctx.actor, target_id: req.params.id },
      });

      res.status(500).json({ success: false, error: errorMessage });
    }
  };

  updateReviewQueue: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
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

      const data = await this.service.updateContribution(ctx, id, req.body);

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
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error updating item";

      await AuditLogger.logError({
        action: "UPDATE_REVIEW_QUEUE",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE",
        code: "400",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "PUT",
        metadata: {
          detailed_user: ctx.actor,
          target_id: req.params.id,
          body: req.body,
        },
      });

      res.status(400).json({ success: false, error: errorMessage });
    }
  };

  updateReviewQueueStatus: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

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

      res.status(400).json({
        success: false,
        error: errorDetails,
      });
      return;
    }

    try {
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

      const data = await this.service.updateContributionStatus(
        ctx,
        id,
        parseResult.data,
      );

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
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error updating status";

      await AuditLogger.logError({
        action: "UPDATE_REVIEW_QUEUE_STATUS",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "review_queue",
        backendCode:
          "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE_STATUS",
        code: "400",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "PATCH",
        metadata: {
          detailed_user: ctx.actor,
          target_id: req.params.id,
          attemptedStatus: parseResult.data.status,
        },
      });

      res.status(400).json({ success: false, error: errorMessage });
    }
  };

  deleteReviewQueue: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
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

      await this.service.deleteContribution(ctx, id);

      await AuditLogger.logActivity({
        action: "DELETE_REVIEW_QUEUE",
        entityType: "review_item",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:SUCCESS_DELETE_REVIEW_QUEUE",
        logStatus: "SUCCESS",
        metadata: { detailed_user: ctx.actor, target_id: id },
      });

      res
        .status(200)
        .json({ success: true, message: "Review queue item deleted cleanly." });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error deleting item";

      await AuditLogger.logError({
        action: "DELETE_REVIEW_QUEUE",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_DELETE_REVIEW_QUEUE",
        code: "400",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "DELETE",
        metadata: { detailed_user: ctx.actor, target_id: req.params.id },
      });

      res.status(400).json({ success: false, error: errorMessage });
    }
  };

  addReviewQueueComment: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    const parseResult = AddCommentPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorDetails =
        parseResult.error.issues[0]?.message ?? "Invalid comment payload";

      await AuditLogger.logError({
        action: "ADD_REVIEW_QUEUE_COMMENT",
        actorUserId: ctx.actor.id,
        errorMessage: errorDetails,
        serviceCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_ADD_REVIEW_QUEUE_COMMENT",
        code: "400",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "POST",
        metadata: { detailed_user: ctx.actor, body: req.body },
      });

      res.status(400).json({
        success: false,
        error: errorDetails,
      });
      return;
    }

    try {
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

      const comment = await this.service.addContributionComment(ctx, id, {
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
          comment_id: comment?.id,
        },
      });

      res.status(201).json({ success: true, data: comment });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error adding comment";

      await AuditLogger.logError({
        action: "ADD_REVIEW_QUEUE_COMMENT",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "review_queue",
        backendCode: "REVIEW_QUEUE_CONTROLLER:FAILED_ADD_REVIEW_QUEUE_COMMENT",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "POST",
        metadata: {
          detailed_user: ctx.actor,
          target_id: req.params.id,
          body: req.body,
        },
      });

      res.status(500).json({ success: false, error: errorMessage });
    }
  };

  updateReviewQueueCommentStatus: RequestHandler = async (
    req,
    res,
  ): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

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

      res.status(400).json({
        success: false,
        error: errorDetails,
      });
      return;
    }

    try {
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

        res
          .status(400)
          .json({ success: false, error: "Invalid or missing comment ID" });
        return;
      }

      const data = await this.service.updateCommentStatus(
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
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error updating comment status";

      await AuditLogger.logError({
        action: "UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "review_queue",
        backendCode:
          "REVIEW_QUEUE_CONTROLLER:FAILED_UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
        code: "400",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "PATCH",
        metadata: {
          detailed_user: ctx.actor,
          comment_id: req.params.commentId,
          body: req.body,
        },
      });

      res.status(400).json({ success: false, error: errorMessage });
    }
  };
}

export const reviewQueueController = new ReviewQueueController();
