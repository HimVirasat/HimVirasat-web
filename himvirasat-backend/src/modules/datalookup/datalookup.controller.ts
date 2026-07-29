import { Request, Response } from "express";
import { DataLookupService, dataLookupService } from "./datalookup.service.js";
import { AuditLogger } from "../../utils/audit-logger.js";

export class DataLookupController {
  constructor(
    private readonly service: DataLookupService = dataLookupService,
  ) {}

  getDialects = async (_req: Request, res: Response) => {
    try {
      const data = await this.service.fetchDialects();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("DataLookup Controller [getDialects] error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve dialects" });
    }
  };

  getCategories = async (_req: Request, res: Response) => {
    try {
      const data = await this.service.fetchCategories();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("DataLookup Controller [getCategories] error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve categories" });
    }
  };

  getPartsOfSpeech = async (_req: Request, res: Response) => {
    try {
      const data = await this.service.fetchPartsOfSpeech();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("DataLookup Controller [getPartsOfSpeech] error:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to retrieve parts of speech",
        });
    }
  };

  getActivityLogs = async (req: Request, res: Response) => {
    try {
      const { status, service } = req.query;
      const data = await this.service.fetchActivityLogs({
        status: status as string,
        service: service as string,
      });
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("DataLookup Controller [getActivityLogs] error:", error);
      
      await AuditLogger.logError({
        userId: (req as any).user?.id || null,
        errorMessage: error.message || "Failed to retrieve activity logs",
        serviceCategory: "datalookup",
        stackTrace: error.stack,
        code: "FETCH_ACTIVITY_LOGS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
      });

      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve activity logs" });
    }
  };

  getErrorLogs = async (req: Request, res: Response) => {
    try {
      const { status, service } = req.query;
      const data = await this.service.fetchErrorLogs({
        status: status as string,
        service: service as string,
      });
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error("DataLookup Controller [getErrorLogs] error:", error);

      await AuditLogger.logError({
        userId: (req as any).user?.id || null,
        errorMessage: error.message || "Failed to retrieve error logs",
        serviceCategory: "datalookup",
        stackTrace: error.stack,
        code: "FETCH_ERROR_LOGS_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
      });

      return res
        .status(500)
        .json({ success: false, message: "Failed to retrieve error logs" });
    }
  };

  generateMetadata = async (req: Request, res: Response) => {
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

      const result = await this.service.generateLinguisticMetadata({
        word_devanagari,
        meaning_hindi,
        meaning_english,
        example_sentence,
      });

      return res
        .status(200)
        .json({ success: true, model: result.model, data: result.data });
    } catch (error) {
      console.error("DataLookup Controller [generateMetadata] error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate metadata";

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  };
}

export const dataLookupController = new DataLookupController();