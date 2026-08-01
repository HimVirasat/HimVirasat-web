import { Request, Response } from "express";
import { DataLookupService, dataLookupService } from "./datalookup.service.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
import { AuditLogger } from "../../utils/audit-logger.js";

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
        userId: ctx.actor.id,
        errorMessage: error.message || "Failed to retrieve dialects",
        serviceCategory: "datalookup",
        stackTrace: error.stack,
        code: "FETCH_DIALECTS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { detailed_user: ctx.actor },
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
        userId: ctx.actor.id,
        errorMessage: error.message || "Failed to retrieve categories",
        serviceCategory: "datalookup",
        stackTrace: error.stack,
        code: "FETCH_CATEGORIES_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { detailed_user: ctx.actor },
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
        userId: ctx.actor.id,
        errorMessage: error.message || "Failed to retrieve parts of speech",
        serviceCategory: "datalookup",
        stackTrace: error.stack,
        code: "FETCH_PARTS_OF_SPEECH_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { detailed_user: ctx.actor },
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
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error(
        "DataLookup Controller [getAvailableRegions] error:",
        error,
      );

      await AuditLogger.logError({
        userId: ctx.actor.id,
        errorMessage: error.message || "Failed to retrieve available regions",
        serviceCategory: "datalookup",
        stackTrace: error.stack,
        code: "FETCH_AVAILABLE_REGIONS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { detailed_user: ctx.actor },
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
      const { status, service } = req.query;
      const data = await this.service.fetchActivityLogs(ctx, {
        status: status as string,
        service: service as string,
      });
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("DataLookup Controller [getActivityLogs] error:", error);

      await AuditLogger.logError({
        userId: ctx.actor.id,
        errorMessage: error.message || "Failed to retrieve activity logs",
        serviceCategory: "datalookup",
        stackTrace: error.stack,
        code: "FETCH_ACTIVITY_LOGS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { query: req.query, detailed_user: ctx.actor },
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
      const { status, service } = req.query;
      const data = await this.service.fetchErrorLogs(ctx, {
        status: status as string,
        service: service as string,
      });
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("DataLookup Controller [getErrorLogs] error:", error);

      await AuditLogger.logError({
        userId: ctx.actor.id,
        errorMessage: error.message || "Failed to retrieve error logs",
        serviceCategory: "datalookup",
        stackTrace: error.stack,
        code: "FETCH_ERROR_LOGS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { query: req.query, detailed_user: ctx.actor },
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
        userId: ctx.actor.id,
        errorMessage,
        serviceCategory: "datalookup",
        stackTrace: error.stack,
        code: "GENERATE_METADATA_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { body: req.body, detailed_user: ctx.actor },
      });

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  };
}

export const dataLookupController = new DataLookupController();