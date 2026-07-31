/**
 * Users Controller
 * File: users.controller.ts
 */

import { RequestHandler } from "express";
import { UsersService, usersService } from "./users.service.js";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { AuditLogger } from "../../utils/audit-logger.js";

export class UsersController {
  constructor(private readonly service: UsersService = usersService) {}

  private getUserId(req: AuthenticatedRequest): string | undefined {
    return req.user?.userId;
  }

  getLanguageExperts: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actorId = this.getUserId(authReq);

    try {
      const experts = await this.service.fetchLanguageExperts(actorId);
      res.json({ success: true, experts });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch language experts";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "users",
        stackTrace: error.stack,
        code: "FETCH_LANGUAGE_EXPERTS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
      });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  createLanguageExpert: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actorId = this.getUserId(authReq);

    try {
      const result = await this.service.createLanguageExpert(req.body, actorId);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(201).json({
        success: true,
        message: "Language expert created successfully",
        expert: result.expert,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create language expert";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "users",
        stackTrace: error.stack,
        code: "CREATE_LANGUAGE_EXPERT_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { username: req.body?.username },
      });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  deleteLanguageExpert: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actorId = this.getUserId(authReq);

    try {
      const { id } = req.body;
      if (!id) {
        res
          .status(400)
          .json({ success: false, message: "User ID is required" });
        return;
      }
      const result = await this.service.deleteLanguageExpert(id, actorId);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Language expert deactivated",
        deleted_id: id,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "users",
        stackTrace: error.stack,
        code: "DELETE_LANGUAGE_EXPERT_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { targetId: req.body?.id },
      });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  getLanguageHeads: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actorId = this.getUserId(authReq);

    try {
      const heads = await this.service.fetchLanguageHeads(actorId);
      res.json({ success: true, heads });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch language heads";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "users",
        stackTrace: error.stack,
        code: "FETCH_LANGUAGE_HEADS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
      });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  createLanguageHead: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actorId = this.getUserId(authReq);

    try {
      const result = await this.service.createLanguageHead(req.body, actorId);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(201).json({
        success: true,
        message: "Language head created successfully",
        head: result.head,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create language head";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "users",
        stackTrace: error.stack,
        code: "CREATE_LANGUAGE_HEAD_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { username: req.body?.username },
      });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  deleteLanguageHead: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actorId = this.getUserId(authReq);

    try {
      const { id } = req.body;
      if (!id) {
        res
          .status(400)
          .json({ success: false, message: "User ID is required" });
        return;
      }
      const result = await this.service.deleteLanguageHead(id, actorId);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Language head deactivated",
        deleted_id: id,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "users",
        stackTrace: error.stack,
        code: "DELETE_LANGUAGE_HEAD_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { targetId: req.body?.id },
      });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  updateExpertDialects: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actorId = this.getUserId(authReq);

    try {
      const { id, dialects } = req.body;
      if (!id || !Array.isArray(dialects)) {
        res.status(400).json({
          success: false,
          message: "User ID and dialects array are required",
        });
        return;
      }
      const result = await this.service.updateExpertDialects(
        id,
        dialects,
        actorId,
      );
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Expert dialects updated",
        expert: result.data,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update dialects";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "users",
        stackTrace: error.stack,
        code: "UPDATE_EXPERT_DIALECTS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { targetId: req.body?.id },
      });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  updateHeadDialects: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const actorId = this.getUserId(authReq);

    try {
      const { id, dialects } = req.body;
      if (!id || !Array.isArray(dialects)) {
        res.status(400).json({
          success: false,
          message: "User ID and dialects array are required",
        });
        return;
      }
      const result = await this.service.updateHeadDialects(
        id,
        dialects,
        actorId,
      );
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Head dialects updated",
        head: result.data,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update managed dialects";

      await AuditLogger.logError({
        userId: actorId || null,
        errorMessage,
        serviceCategory: "users",
        stackTrace: error.stack,
        code: "UPDATE_HEAD_DIALECTS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { targetId: req.body?.id },
      });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };
  // getDetailedUserInfo: RequestHandler = async (req, res): Promise<void> => {
  //   const authReq = req as AuthenticatedRequest;
  //   const actorId = this.getUserId(authReq);

  // }
}

export const usersController = new UsersController();
