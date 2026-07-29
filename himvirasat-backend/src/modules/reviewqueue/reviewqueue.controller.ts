/**
 * Review Queue Controller
 * File: reviewqueue.controller.ts
 */

import { RequestHandler } from "express";
import {
  ReviewQueueService,
  reviewQueueService,
} from "./reviewqueue.service.js";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
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

  private getUserId(req: AuthenticatedRequest): string | undefined {
    return req.user?.userId;
  }

  private getStringParam(param: string | string[] | undefined): string | null {
    if (typeof param === "string") return param;
    return null;
  }

  createReviewQueue: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const contributor_id = this.getUserId(authReq);

    if (!contributor_id) {
      res
        .status(401)
        .json({ success: false, error: "Authentication missing." });
      return;
    }

    try {
      const data = await this.service.createContribution(
        contributor_id,
        req.body,
      );
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error creating item";

      await AuditLogger.logError({
        userId: contributor_id,
        errorMessage,
        serviceCategory: "review_queue",
        stackTrace: error.stack,
        code: "CREATE_CONTRIBUTION_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { body: req.body },
      });

      res.status(400).json({ success: false, error: errorMessage });
    }
  };

  getReviewQueue: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getUserId(authReq);

    try {
      const filterValidation = ContributionFiltersSchema.safeParse({
        status: req.query.status,
        dialect_id: req.query.dialect_id
          ? Number(req.query.dialect_id)
          : undefined,
      });

      if (!filterValidation.success) {
        res.status(400).json({
          success: false,
          error:
            filterValidation.error.issues[0]?.message ??
            "Invalid filter parameters",
          requestId: res.locals.requestId,
        });
        return;
      }

      const data = await this.service.fetchContributions(filterValidation.data);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error fetching items";

      await AuditLogger.logError({
        userId: userId || null,
        errorMessage,
        serviceCategory: "review_queue",
        stackTrace: error.stack,
        code: "FETCH_CONTRIBUTIONS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { query: req.query },
      });

      res.status(500).json({ success: false, error: errorMessage });
    }
  };

  getReviewQueueById: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getUserId(authReq);

    try {
      const id = this.getStringParam(req.params.id);
      if (!id) {
        res
          .status(400)
          .json({
            success: false,
            error: "Invalid or missing contribution ID",
          });
        return;
      }

      const item = await this.service.fetchContributionById(id);
      if (!item) {
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
        userId: userId || null,
        errorMessage,
        serviceCategory: "review_queue",
        stackTrace: error.stack,
        code: "FETCH_CONTRIBUTION_BY_ID_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { id: req.params.id },
      });

      res.status(500).json({ success: false, error: errorMessage });
    }
  };

  updateReviewQueue: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actor_id = this.getUserId(authReq);

    if (!actor_id) {
      res
        .status(401)
        .json({ success: false, error: "Authentication missing." });
      return;
    }

    try {
      const id = this.getStringParam(req.params.id);
      if (!id) {
        res
          .status(400)
          .json({
            success: false,
            error: "Invalid or missing contribution ID",
          });
        return;
      }

      const data = await this.service.updateContribution(
        id,
        actor_id,
        req.body,
      );
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error updating item";

      await AuditLogger.logError({
        userId: actor_id,
        errorMessage,
        serviceCategory: "review_queue",
        stackTrace: error.stack,
        code: "UPDATE_CONTRIBUTION_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { id: req.params.id, body: req.body },
      });

      res.status(400).json({ success: false, error: errorMessage });
    }
  };

  updateReviewQueueStatus: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actor_id = this.getUserId(authReq);

    if (!actor_id) {
      res
        .status(401)
        .json({ success: false, error: "Authentication missing." });
      return;
    }

    const parseResult = UpdateStatusPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Invalid status payload",
      });
      return;
    }

    try {
      const id = this.getStringParam(req.params.id);
      if (!id) {
        res
          .status(400)
          .json({
            success: false,
            error: "Invalid or missing contribution ID",
          });
        return;
      }

      const data = await this.service.updateContributionStatus(
        id,
        actor_id,
        parseResult.data,
      );
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error updating status";

      await AuditLogger.logError({
        userId: actor_id,
        errorMessage,
        serviceCategory: "review_queue",
        stackTrace: error.stack,
        code: "STATUS_UPDATE_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { id: req.params.id, attemptedStatus: parseResult.data.status },
      });

      res.status(400).json({ success: false, error: errorMessage });
    }
  };

  deleteReviewQueue: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actor_id = this.getUserId(authReq);

    try {
      const id = this.getStringParam(req.params.id);
      if (!id) {
        res
          .status(400)
          .json({
            success: false,
            error: "Invalid or missing contribution ID",
          });
        return;
      }

      await this.service.deleteContribution(id);
      res
        .status(200)
        .json({ success: true, message: "Review queue item deleted cleanly." });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error deleting item";

      await AuditLogger.logError({
        userId: actor_id || null,
        errorMessage,
        serviceCategory: "review_queue",
        stackTrace: error.stack,
        code: "DELETE_CONTRIBUTION_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { id: req.params.id },
      });

      res.status(400).json({ success: false, error: errorMessage });
    }
  };

  addReviewQueueComment: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const author_id = this.getUserId(authReq);

    if (!author_id) {
      res
        .status(401)
        .json({ success: false, error: "Authentication missing." });
      return;
    }

    const parseResult = AddCommentPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error:
          parseResult.error.issues[0]?.message ?? "Invalid comment payload",
      });
      return;
    }

    try {
      const id = this.getStringParam(req.params.id);
      if (!id) {
        res
          .status(400)
          .json({
            success: false,
            error: "Invalid or missing contribution ID",
          });
        return;
      }

      const { field_name, message } = parseResult.data;
      const cleanFieldName =
        field_name && field_name.trim() !== "" ? field_name.trim() : "General";

      const comment = await this.service.addContributionComment(id, author_id, {
        field_name: cleanFieldName,
        message,
      });

      res.status(201).json({ success: true, data: comment });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Error adding comment";

      await AuditLogger.logError({
        userId: author_id,
        errorMessage,
        serviceCategory: "review_queue",
        stackTrace: error.stack,
        code: "ADD_COMMENT_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { id: req.params.id, body: req.body },
      });

      res.status(500).json({ success: false, error: errorMessage });
    }
  };

  updateReviewQueueCommentStatus: RequestHandler = async (
    req,
    res,
  ): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actor_id = this.getUserId(authReq);

    if (!actor_id) {
      res
        .status(401)
        .json({ success: false, error: "Authentication missing." });
      return;
    }

    const parseResult = UpdateCommentStatusPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error:
          parseResult.error.issues[0]?.message ??
          "Invalid comment status payload",
      });
      return;
    }

    try {
      const commentId = this.getStringParam(req.params.commentId);
      if (!commentId) {
        res
          .status(400)
          .json({ success: false, error: "Invalid or missing comment ID" });
        return;
      }

      const data = await this.service.updateCommentStatus(
        commentId,
        actor_id,
        parseResult.data,
      );

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error updating comment status";

      await AuditLogger.logError({
        userId: actor_id,
        errorMessage,
        serviceCategory: "review_queue",
        stackTrace: error.stack,
        code: "UPDATE_COMMENT_STATUS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { commentId: req.params.commentId, body: req.body },
      });

      res.status(400).json({ success: false, error: errorMessage });
    }
  };
}

export const reviewQueueController = new ReviewQueueController();