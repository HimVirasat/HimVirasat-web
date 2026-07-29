import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { reviewQueueController } from "./reviewqueue.controller.js";

const router = Router();

router.post("/", requireAuth, reviewQueueController.createReviewQueue);
router.get("/", requireAuth, reviewQueueController.getReviewQueue);
router.get("/:id", requireAuth, reviewQueueController.getReviewQueueById);
router.put("/:id", requireAuth, reviewQueueController.updateReviewQueue);
router.delete("/:id", requireAuth, reviewQueueController.deleteReviewQueue);
router.patch(
  "/:id/status",
  requireAuth,
  reviewQueueController.updateReviewQueueStatus,
);
router.post(
  "/:id/comments",
  requireAuth,
  reviewQueueController.addReviewQueueComment,
);
router.patch(
  "/:id/comments/:commentId/status",
  requireAuth,
  reviewQueueController.updateReviewQueueCommentStatus,
);

export default router;
