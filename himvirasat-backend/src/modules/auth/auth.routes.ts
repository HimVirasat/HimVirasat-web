import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);
router.post("/reset-password", requireAuth, authController.resetPassword);

export default router;
