import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authController } from "./auth.controller.js";

const router = Router();

// router.post("/login", authController.deprecatedLocalAuth);
// router.post("/signup", authController.deprecatedLocalAuth);
// router.post("/logout", authController.deprecatedLocalAuth);
router.get("/me", requireAuth, authController.me);
// router.post("/reset-password", requireAuth, authController.deprecatedLocalAuth);

export default router;
