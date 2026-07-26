import { RequestHandler } from "express";
import * as service from "./reviewqueue.service.js";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import {
  ContributionFiltersSchema,
  UpdateStatusPayloadSchema,
  AddCommentPayloadSchema,
  UpdateCommentStatusPayloadSchema,
} from "@himvirasat/shared";

const getUserId = (req: AuthenticatedRequest): string | undefined =>
  req.user?.userId || (req.user as any)?.id;

const getStringParam = (param: string | string[] | undefined): string | null => {
  if (typeof param === "string") return param;
  return null;
};

export const createReviewQueue: RequestHandler = async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const contributor_id = getUserId(authReq);
  if (!contributor_id) {
    res.status(401).json({ success: false, error: "Authentication missing." });
    return;
  }
  try {
    const data = await service.createContribution(contributor_id, req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getReviewQueue: RequestHandler = async (req, res): Promise<void> => {
  try {
    const filterValidation = ContributionFiltersSchema.safeParse({
      status: req.query.status,
      dialect_id: req.query.dialect_id ? Number(req.query.dialect_id) : undefined,
    });
    if (!filterValidation.success) {
      res.status(400).json({
        success: false,
        error: filterValidation.error.issues[0]?.message ?? "Invalid filter parameters",
        requestId: res.locals.requestId,
      });
      return;
    }
    const data = await service.fetchContributions(filterValidation.data);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getReviewQueueById: RequestHandler = async (req, res): Promise<void> => {
  try {
    const id = getStringParam(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: "Invalid or missing contribution ID" });
      return;
    }
    const item = await service.fetchContributionById(id);
    if (!item) {
      res.status(404).json({ success: false, message: "Review queue item not found" });
      return;
    }
    res.status(200).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateReviewQueue: RequestHandler = async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const actor_id = getUserId(authReq);
  if (!actor_id) {
    res.status(401).json({ success: false, error: "Authentication missing." });
    return;
  }
  try {
    const id = getStringParam(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: "Invalid or missing contribution ID" });
      return;
    }
    const data = await service.updateContribution(id, actor_id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateReviewQueueStatus: RequestHandler = async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const actor_id = getUserId(authReq);
  if (!actor_id) {
    res.status(401).json({ success: false, error: "Authentication missing." });
    return;
  }
  const parseResult = UpdateStatusPayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Invalid status payload",
    });
    return;
  }
  try {
    const id = getStringParam(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: "Invalid or missing contribution ID" });
      return;
    }
    const data = await service.updateContributionStatus(id, actor_id, parseResult.data);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteReviewQueue: RequestHandler = async (req, res): Promise<void> => {
  try {
    const id = getStringParam(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: "Invalid or missing contribution ID" });
      return;
    }
    await service.deleteContribution(id);
    res.status(200).json({ success: true, message: "Review queue item deleted cleanly." });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const addReviewQueueComment: RequestHandler = async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const author_id = getUserId(authReq);
  if (!author_id) {
    res.status(401).json({ success: false, error: "Authentication missing." });
    return;
  }
  const parseResult = AddCommentPayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Invalid comment payload",
    });
    return;
  }
  try {
    const id = getStringParam(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: "Invalid or missing contribution ID" });
      return;
    }
    const { field_name, message } = parseResult.data;
    const cleanFieldName = field_name && field_name.trim() !== "" ? field_name.trim() : "General";
    const comment = await service.addContributionComment(id, author_id, {
      field_name: cleanFieldName,
      message,
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateReviewQueueCommentStatus: RequestHandler = async (req, res): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const actor_id = getUserId(authReq);
  if (!actor_id) {
    res.status(401).json({ success: false, error: "Authentication missing." });
    return;
  }
  const parseResult = UpdateCommentStatusPayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: parseResult.error.issues[0]?.message ?? "Invalid comment status payload",
    });
    return;
  }
  try {
    const commentId = getStringParam(req.params.commentId);
    if (!commentId) {
      res.status(400).json({ success: false, error: "Invalid or missing comment ID" });
      return;
    }
    const data = await service.updateCommentStatus(commentId, actor_id, parseResult.data);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};