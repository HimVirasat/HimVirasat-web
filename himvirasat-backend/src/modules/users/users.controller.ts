import { RequestHandler } from "express";
import { UsersService, usersService } from "./users.service.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
// import { AuditLogger } from "../../utils/audit-logger.js";

export class UsersController {
  constructor(private readonly service: UsersService = usersService) {}

  private getSecurityContext(req: StrictAuthenticatedRequest): SecurityContext {
    return {
      actor: req._cachedUser,
    };
  }

  getLanguageExperts: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const experts = await this.service.fetchLanguageExperts(ctx);
      res.json({ success: true, experts });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch language experts";

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "users",
      //   stackTrace: error.stack,
      //   code: "FETCH_LANGUAGE_EXPERTS_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { detailed_user: ctx.actor },
      // });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  createLanguageExpert: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const result = await this.service.createLanguageExpert(ctx, req.body);
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

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "users",
      //   stackTrace: error.stack,
      //   code: "CREATE_LANGUAGE_EXPERT_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { username: req.body?.username, detailed_user: ctx.actor },
      // });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  deleteLanguageExpert: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const { id } = req.body;
      if (!id) {
        res
          .status(400)
          .json({ success: false, message: "User ID is required" });
        return;
      }
      const result = await this.service.deleteLanguageExpert(ctx, id);
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

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "users",
      //   stackTrace: error.stack,
      //   code: "DELETE_LANGUAGE_EXPERT_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { targetId: req.body?.id, detailed_user: ctx.actor },
      // });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  getLanguageHeads: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const heads = await this.service.fetchLanguageHeads(ctx);
      res.json({ success: true, heads });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch language heads";

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "users",
      //   stackTrace: error.stack,
      //   code: "FETCH_LANGUAGE_HEADS_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { detailed_user: ctx.actor },
      // });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  createLanguageHead: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const result = await this.service.createLanguageHead(ctx, req.body);
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

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "users",
      //   stackTrace: error.stack,
      //   code: "CREATE_LANGUAGE_HEAD_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { username: req.body?.username, detailed_user: ctx.actor },
      // });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  deleteLanguageHead: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const { id } = req.body;
      if (!id) {
        res
          .status(400)
          .json({ success: false, message: "User ID is required" });
        return;
      }
      const result = await this.service.deleteLanguageHead(ctx, id);
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

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "users",
      //   stackTrace: error.stack,
      //   code: "DELETE_LANGUAGE_HEAD_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { targetId: req.body?.id, detailed_user: ctx.actor },
      // });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  updateExpertDialects: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const { id, dialects } = req.body;
      if (!id || !Array.isArray(dialects)) {
        res.status(400).json({
          success: false,
          message: "User ID and dialects array are required",
        });
        return;
      }
      const result = await this.service.updateExpertDialects(ctx, id, dialects);
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

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "users",
      //   stackTrace: error.stack,
      //   code: "UPDATE_EXPERT_DIALECTS_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { targetId: req.body?.id, detailed_user: ctx.actor },
      // });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };

  updateHeadDialects: RequestHandler = async (req, res): Promise<void> => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const { id, dialects } = req.body;
      if (!id || !Array.isArray(dialects)) {
        res.status(400).json({
          success: false,
          message: "User ID and dialects array are required",
        });
        return;
      }
      const result = await this.service.updateHeadDialects(ctx, id, dialects);
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

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "users",
      //   stackTrace: error.stack,
      //   code: "UPDATE_HEAD_DIALECTS_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { targetId: req.body?.id, detailed_user: ctx.actor },
      // });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };
}

export const usersController = new UsersController();
