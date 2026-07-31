import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/roles.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("super_admin", "language_head", "language_expert"),
  dashboardController.getDashboardStats,
);

export default router;
