import { RequestHandler } from "express";
import { UsersService, usersService } from "./users.service.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
import { AuditLogger } from "../../utils/audit-logger.js";

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

      await AuditLogger.logError({
        action: "FETCH_LANGUAGE_EXPERT",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "users",
        backendCode: "USER_CONTROLLER:FAILED_FETCH_LANGUAGE_EXPERT",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "GET",
        metadata: { detailed_user: ctx.actor },
      });

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
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create language expert";

      await AuditLogger.logError({
        action: "CREATE_LANGUAGE_EXPERT",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "users",
        backendCode: "USER_CONTROLLER:FAILED_CREATE_LANGUAGE_EXPERT",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "POST",
        metadata: { detailed_user: ctx.actor },
      });

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

      const result = await this.service.deleteLanguageExpert(ctx, id);
      if (!result.success) {
        const failureMessage =
          result.message ?? "Failed to delete language expert";

        await AuditLogger.logError({
          action: "DELETE_LANGUAGE_EXPERT",
          actorUserId: ctx.actor.id,
          errorMessage: failureMessage,
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_DELETE_LANGUAGE_EXPERT",
          code: result.statusCode ? (String(result.statusCode) as any) : "500",
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
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      await AuditLogger.logError({
        action: "DELETE_LANGUAGE_EXPERT",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "users",
        backendCode: "USER_CONTROLLER:FAILED_DELETE_LANGUAGE_EXPERT",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "DELETE",
        metadata: { detailed_user: ctx.actor },
      });

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

      await AuditLogger.logError({
        action: "FETCH_LANGUAGE_HEADS",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "users",
        backendCode: "USER_CONTROLLER:FAILED_FETCH_LANGUAGE_HEADS",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "GET",
        metadata: { detailed_user: ctx.actor },
      });

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
        const failureMessage =
          result.message ?? "Failed to create language head";

        await AuditLogger.logError({
          action: "CREATE_LANGUAGE_HEAD",
          actorUserId: ctx.actor.id,
          errorMessage: failureMessage,
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_CREATE_LANGUAGE_HEAD",
          code: result.statusCode ? (String(result.statusCode) as any) : "500",
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
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create language head";

      await AuditLogger.logError({
        action: "CREATE_LANGUAGE_HEAD",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "users",
        backendCode: "USER_CONTROLLER:FAILED_CREATE_LANGUAGE_HEAD",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "POST",
        metadata: { detailed_user: ctx.actor },
      });

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

      const result = await this.service.deleteLanguageHead(ctx, id);
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
          code: result.statusCode ? (String(result.statusCode) as any) : "500",
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
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      await AuditLogger.logError({
        action: "DELETE_LANGUAGE_HEAD",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "users",
        backendCode: "USER_CONTROLLER:FAILED_DELETE_LANGUAGE_HEAD",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "DELETE",
        metadata: { detailed_user: ctx.actor },
      });

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

      const result = await this.service.updateExpertDialects(ctx, id, dialects);
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
          code: result.statusCode ? (String(result.statusCode) as any) : "500",
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
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update dialects";

      await AuditLogger.logError({
        action: "UPDATE_EXPERT_DIALECTS",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "users",
        backendCode: "USER_CONTROLLER:FAILED_UPDATE_EXPERT_DIALECTS",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "PATCH",
        metadata: { detailed_user: ctx.actor, target_id: req.body?.id },
      });

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

      const result = await this.service.updateHeadDialects(ctx, id, dialects);
      if (!result.success) {
        const failureMessage =
          result.message ?? "Failed to update managed dialects";

        await AuditLogger.logError({
          action: "UPDATE_HEAD_DIALECTS",
          actorUserId: ctx.actor.id,
          errorMessage: failureMessage,
          serviceCategory: "users",
          backendCode: "USER_CONTROLLER:FAILED_UPDATE_HEAD_DIALECTS",
          code: result.statusCode ? (String(result.statusCode) as any) : "500",
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
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update managed dialects";

      await AuditLogger.logError({
        action: "UPDATE_HEAD_DIALECTS",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error.stack,
        serviceCategory: "users",
        backendCode: "USER_CONTROLLER:FAILED_UPDATE_HEAD_DIALECTS",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "PATCH",
        metadata: { detailed_user: ctx.actor, target_id: req.body?.id },
      });

      res.status(500).json({ success: false, message: errorMessage });
    }
  };
}

export const usersController = new UsersController();
