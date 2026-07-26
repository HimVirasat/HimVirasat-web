import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as controller from "./reviewqueue.controller.js";

const router = Router();

router.post("/", requireAuth, controller.createReviewQueue);
router.get("/", requireAuth, controller.getReviewQueue);
router.get("/:id", requireAuth, controller.getReviewQueueById);
router.put("/:id", requireAuth, controller.updateReviewQueue);
router.delete("/:id", requireAuth, controller.deleteReviewQueue);
router.patch("/:id/status", requireAuth, controller.updateReviewQueueStatus);
router.post("/:id/comments", requireAuth, controller.addReviewQueueComment);
router.patch("/:id/comments/:commentId/status", requireAuth, controller.updateReviewQueueCommentStatus);

export default router;