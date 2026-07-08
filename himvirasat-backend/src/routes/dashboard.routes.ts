import { Router } from "express";

import { getDashboardStats } from "../handlers/dashboard.handler.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getDashboardStats);

export default router;
