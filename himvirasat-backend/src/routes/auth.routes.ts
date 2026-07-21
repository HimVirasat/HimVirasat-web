import { Router } from "express";

import { login, logout, me, resetPassword } from "../handlers/auth.handler.js";
// import { requireRole } from "../middlewares/roles.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);

router.post("/logout", logout);

// router.get("/me", requireAuth, requireRole("super_admin"), requireRole("language_expert"), me);
router.get("/me", requireAuth, me);
router.post("/reset-password", requireAuth, resetPassword);
export default router;
