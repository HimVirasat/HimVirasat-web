/**
 * Submissions Controller
 * File: submissions.controller.ts
 */

import { RequestHandler } from "express";
import {
  SubmissionsService,
  submissionsService,
} from "./submissions.service.js";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { CreateSubmissionSchema } from "@himvirasat/shared";
import { AuditLogger } from "../../utils/audit-logger.js";

export class SubmissionsController {
  constructor(
    private readonly service: SubmissionsService = submissionsService,
  ) {}

  private getUserId(req: AuthenticatedRequest): string | undefined {
    return req.user?.userId;
  }

  createSubmission: RequestHandler = async (req, res): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const contributor_id = this.getUserId(authReq);

    if (!contributor_id) {
      res
        .status(401)
        .json({ success: false, error: "Authentication missing." });
      return;
    }

    const validationResult = CreateSubmissionSchema.safeParse({
      ...req.body,
      dialect_id: req.body.dialect_id ? Number(req.body.dialect_id) : undefined,
      category_id: req.body.category_id ? Number(req.body.category_id) : null,
      part_of_speech_id: req.body.part_of_speech_id
        ? Number(req.body.part_of_speech_id)
        : null,
    });

    if (!validationResult.success) {
      const errorDetails = validationResult.error.issues
        .map((i) => i.message)
        .join(", ");

      res
        .status(400)
        .json({ success: false, error: `Validation error: ${errorDetails}` });
      return;
    }

    try {
      const contribution = await this.service.createSubmission(
        contributor_id,
        validationResult.data,
      );

      res.status(201).json({
        success: true,
        message: "Vocabulary entry submitted successfully.",
        data: contribution,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      await AuditLogger.logError({
        userId: contributor_id,
        errorMessage,
        serviceCategory: "submissions",
        stackTrace: error.stack,
        code: "CREATE_SUBMISSION_FAILED",
        path: req.originalUrl || req.path,
        method: req.method,
        metadata: { body: req.body },
      });

      res.status(500).json({ success: false, error: errorMessage });
    }
  };
}

export const submissionsController = new SubmissionsController();
