import { RequestHandler } from "express";
import * as service from "./submissions.service.js";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { CreateSubmissionSchema } from "@himvirasat/shared";

export const createSubmission: RequestHandler = async (
  req,
  res,
): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const contributor_id = authReq.user?.userId || (authReq.user as any)?.id;
  if (!contributor_id) {
    res.status(401).json({ success: false, error: "Authentication missing." });
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
    const contribution = await service.createSubmission(
      contributor_id,
      validationResult.data,
    );
    res.status(201).json({
      success: true,
      message: "Vocabulary entry submitted successfully.",
      data: contribution,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
