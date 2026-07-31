import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/roles.middleware.js";
import { reviewQueueController } from "./reviewqueue.controller.js";

const router = Router();

const requireReviewerRole = requireRole(
  "super_admin",
  "language_head",
  "language_expert",
);

router.post(
  "/",
  requireAuth,
  requireReviewerRole,
  reviewQueueController.createReviewQueue,
);
router.get(
  "/",
  requireAuth,
  requireReviewerRole,
  reviewQueueController.getReviewQueue,
);
router.get(
  "/:id",
  requireAuth,
  requireReviewerRole,
  reviewQueueController.getReviewQueueById,
);
router.put(
  "/:id",
  requireAuth,
  requireReviewerRole,
  reviewQueueController.updateReviewQueue,
);
router.delete(
  "/:id",
  requireAuth,
  requireReviewerRole,
  reviewQueueController.deleteReviewQueue,
);
router.patch(
  "/:id/status",
  requireAuth,
  requireReviewerRole,
  reviewQueueController.updateReviewQueueStatus,
);
router.post(
  "/:id/comments",
  requireAuth,
  requireReviewerRole,
  reviewQueueController.addReviewQueueComment,
);
router.patch(
  "/:id/comments/:commentId/status",
  requireAuth,
  requireReviewerRole,
  reviewQueueController.updateReviewQueueCommentStatus,
);

export default router;
