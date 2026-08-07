import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/roles.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

// GET /dashboard/users?role=language_expert
router.get(
  "/users",
  requireAuth,
  requireRole("super_admin", "language_head", "language_expert"),
  dashboardController.getUsersByRole,
);

// GET /dashboard/me
router.get(
  "/me",
  requireAuth,
  dashboardController.getMyProfile,
);

export default router;