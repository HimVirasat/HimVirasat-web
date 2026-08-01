import { RequestHandler } from "express";
import {
  SubmissionsService,
  submissionsService,
} from "./submissions.service.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
import { CreateSubmissionSchema } from "@himvirasat/shared";
// import { AuditLogger } from "../../utils/audit-logger.js";

export class SubmissionsController {
  constructor(
    private readonly service: SubmissionsService = submissionsService,
  ) {}

  private getSecurityContext(req: StrictAuthenticatedRequest): SecurityContext {
    return {
      actor: req._cachedUser,
    };
  }

  createSubmission: RequestHandler = async (req, res): Promise<void> => {
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
        ctx,
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

      // await AuditLogger.logError({
      //   userId: ctx.actor.id,
      //   errorMessage,
      //   serviceCategory: "submissions",
      //   stackTrace: error.stack,
      //   code: "CREATE_SUBMISSION_FAILED",
      //   path: req.originalUrl || req.path,
      //   method: req.method,
      //   metadata: { body: req.body, detailed_user: ctx.actor },
      // });

      res.status(500).json({ success: false, error: errorMessage });
    }
  };
}

export const submissionsController = new SubmissionsController();
