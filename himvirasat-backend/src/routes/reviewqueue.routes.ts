import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  createReviewQueueHandler,
  getReviewQueueHandler,
  getReviewQueueByIdHandler,
  updateReviewQueueHandler,
  updateReviewQueueStatusHandler,
  deleteReviewQueueHandler,
  addReviewQueueCommentHandler,
  updateReviewQueueCommentStatusHandler,
} from "../handlers/reviewqueue.handler.js";

const router = Router();

// Core CRUD Operations
router.post("/", requireAuth, createReviewQueueHandler);
router.get("/", requireAuth, getReviewQueueHandler);
router.get("/:id", requireAuth, getReviewQueueByIdHandler);
router.put("/:id", requireAuth, updateReviewQueueHandler);
router.delete("/:id", requireAuth, deleteReviewQueueHandler);

// Specialized Sub-resource Lifecycle Actions
router.patch("/:id/status", requireAuth, updateReviewQueueStatusHandler);
router.post("/:id/comments", requireAuth, addReviewQueueCommentHandler);
router.patch(
  "/:id/comments/:commentId/status",
  requireAuth,
  updateReviewQueueCommentStatusHandler,
);

export default router;
