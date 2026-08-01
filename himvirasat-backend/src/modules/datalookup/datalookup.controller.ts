import { Request, Response } from "express";
import { DataLookupService, dataLookupService } from "./datalookup.service.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
import { AuditLogger } from "../../utils/audit-logger.js";
import { METHODS } from "@himvirasat/shared";

export class DataLookupController {
  constructor(
    private readonly service: DataLookupService = dataLookupService,
  ) {}

  private getSecurityContext(req: StrictAuthenticatedRequest): SecurityContext {
    return {
      actor: req._cachedUser,
    };
  }

  getDialects = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const data = await this.service.fetchDialects(ctx);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("DataLookup Controller [getDialects] error:", error);

      await AuditLogger.logError({
        actorUserId: ctx.actor.id,
        action: "GET_ENTRIES",
        errorMessage: error.message || "Failed to retrieve dialects",
        serviceCategory: "datalookup",
        backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_DIALECTS",
        code: "500",
        method: req.method as METHODS,
        path: req.originalUrl || req.path,
        stackTrace: error.stack,
        metadata: { actor: ctx.actor },
        logStatus: "FAILED",
      });

      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve dialects" });
    }
  };

  getCategories = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const data = await this.service.fetchCategories(ctx);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("DataLookup Controller [getCategories] error:", error);

      await AuditLogger.logError({
        actorUserId: ctx.actor.id,
        action: "GET_ENTRIES",
        errorMessage: error.message || "Failed to retrieve categories",
        serviceCategory: "datalookup",
        backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_CATEGORIES",
        code: "500",
        method: req.method as METHODS,
        path: req.originalUrl || req.path,
        stackTrace: error.stack,
        metadata: { actor: ctx.actor },
        logStatus: "FAILED",
      });

      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve categories" });
    }
  };

  getPartsOfSpeech = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const data = await this.service.fetchPartsOfSpeech(ctx);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("DataLookup Controller [getPartsOfSpeech] error:", error);

      await AuditLogger.logError({
        actorUserId: ctx.actor.id,
        action: "GET_ENTRIES",
        errorMessage: error.message || "Failed to retrieve parts of speech",
        serviceCategory: "datalookup",
        backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_PARTS_OF_SPEECH",
        code: "500",
        method: req.method as METHODS,
        path: req.originalUrl || req.path,
        stackTrace: error.stack,
        metadata: { actor: ctx.actor },
        logStatus: "FAILED",
      });

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve parts of speech",
      });
    }
  };

  getAvailableRegions = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const data = await this.service.fetchAvailableRegions(ctx);
      await AuditLogger.logActivity({
        actorUserId: ctx.actor.id,
        action: "GET_ENTRIES",
        backendCode: "DATALOOKUP_SERVICE:SUCCESS_GET_AVAILABLE_REGIONS",
        backendModuleCategory: "datalookup",
        entityType: "user",
        logStatus: "SUCCESS",
        metadata: { cachedUser },
      });
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error(
        "DataLookup Controller [getAvailableRegions] error:",
        error,
      );

      await AuditLogger.logError({
        actorUserId: ctx.actor.id,
        action: "GET_ENTRIES",
        errorMessage: error.message || "Failed to retrieve available regions",
        serviceCategory: "datalookup",
        backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_ENTRIES",
        code: "500",
        method: req.method as METHODS,
        path: req.originalUrl || req.path,
        stackTrace: error.stack,
        metadata: { actor: ctx.actor },
        logStatus: "FAILED",
      });

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve Available Regions",
      });
    }
  };

  getActivityLogs = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const { status, service, page, limit } = req.query;
      const data = await this.service.fetchActivityLogs(ctx, {
        status: status ? (status as any) : undefined,
        service: service ? (service as any) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("DataLookup Controller [getActivityLogs] error:", error);

      await AuditLogger.logError({
        actorUserId: ctx.actor.id,
        action: "GET_ENTRIES",
        errorMessage: error.message || "Failed to retrieve activity logs",
        serviceCategory: "datalookup",
        backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_ACTIVITY_LOGS",
        code: "500",
        method: req.method as METHODS,
        path: req.originalUrl || req.path,
        stackTrace: error.stack,
        metadata: { query: req.query, actor: ctx.actor },
        logStatus: "FAILED",
      });

      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve activity logs" });
    }
  };

  getErrorLogs = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const { status, service, page, limit } = req.query;
      const data = await this.service.fetchErrorLogs(ctx, {
        status: status ? (status as any) : undefined,
        service: service ? (service as any) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("DataLookup Controller [getErrorLogs] error:", error);

      await AuditLogger.logError({
        actorUserId: ctx.actor.id,
        action: "GET_ENTRIES",
        errorMessage: error.message || "Failed to retrieve error logs",
        serviceCategory: "datalookup",
        backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_ERROR_LOGS",
        code: "500",
        method: req.method as METHODS,
        path: req.originalUrl || req.path,
        stackTrace: error.stack,
        metadata: { query: req.query, actor: ctx.actor },
        logStatus: "FAILED",
      });

      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve error logs" });
    }
  };

  generateMetadata = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const {
        word_devanagari,
        meaning_hindi,
        meaning_english,
        example_sentence,
      } = req.body;

      if (!word_devanagari || typeof word_devanagari !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Devanagari word is required" });
      }

      const result = await this.service.generateLinguisticMetadata(ctx, {
        word_devanagari,
        meaning_hindi,
        meaning_english,
        example_sentence,
      });

      return res
        .status(200)
        .json({ success: true, model: result.model, data: result.data });
    } catch (error: any) {
      console.error("DataLookup Controller [generateMetadata] error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate metadata";

      await AuditLogger.logError({
        actorUserId: ctx.actor.id,
        action: "GET_ENTRIES",
        errorMessage,
        serviceCategory: "datalookup",
        backendCode: "DATALOOKUP_CONTROLLER:FAILED_GENERATE_METADATA",
        code: "500",
        method: req.method as METHODS,
        path: req.originalUrl || req.path,
        stackTrace: error.stack,
        metadata: { body: req.body, actor: ctx.actor },
        logStatus: "FAILED",
      });

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  };
}

export const dataLookupController = new DataLookupController();
