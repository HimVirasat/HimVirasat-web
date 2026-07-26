import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as controller from "./dashboard.controller.js";

const router = Router();
router.get("/", requireAuth, controller.getDashboardStats);
export default router;
