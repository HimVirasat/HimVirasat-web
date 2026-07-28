import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.get("/", requireAuth, dashboardController.getDashboardStats);

export default router;