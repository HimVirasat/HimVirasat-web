import { RequestHandler } from "express";
import { randomUUID } from "crypto";
import { CreateSubmissionSchema } from "@himvirasat/shared/submission";

import { supabase } from "../services/supabase.js";
import { logger } from "../utils/logger.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const getUserId = (req: AuthenticatedRequest): string | undefined => {
  return req.user?.userId || (req.user as any)?.id;
};

// POST /submissions
export const createSubmissionHandler: RequestHandler = async (
  req,
  res,
): Promise<void> => {
  const startedAt = performance.now();
  const authReq = req as AuthenticatedRequest;
  const contributor_id = getUserId(authReq);

  if (!contributor_id) {
    res.status(401).json({ success: false, error: "Authentication missing." });
    return;
  }

  // 1. Validate payload using shared Zod schema
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
      .map((issue) => issue.message)
      .join(", ");

    res.status(400).json({
      success: false,
      error: `Validation error: ${errorDetails}`,
    });
    return;
  }

  const validatedPayload = validationResult.data;

  try {
    // 2. Build insertion payload
    const contributionData = {
      id: randomUUID(),
      contributor_id,
      ...validatedPayload,
      status: "under_review",
    };

    // 3. Insert new submission row directly into 'contributions'
    const { data: contribution, error: insertError } = await supabase
      .from("contributions")
      .insert([contributionData])
      .select()
      .single();

    if (insertError) {
      logger.error("Failed to insert contribution submission", insertError);
      res.status(400).json({ success: false, error: insertError.message });
      return;
    }

    // 4. Create initial entry in contribution_history
    const { error: historyError } = await supabase
      .from("contribution_history")
      .insert([
        {
          contribution_id: contribution.id,
          actor_id: contributor_id,
          type: "submitted",
          message: "New vocabulary entry submitted for review.",
        },
      ]);

    if (historyError) {
      logger.warn(
        "Failed to write initial contribution history record",
        historyError,
      );
    }

    res.status(201).json({
      success: true,
      message: "Vocabulary entry submitted successfully.",
      data: contribution,
    });
  } catch (error: any) {
    logger.error("createSubmissionHandler failed", error, {
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    });
    res.status(500).json({ success: false, error: error.message });
  }
};
