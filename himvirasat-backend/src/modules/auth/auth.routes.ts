import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as controller from "./auth.controller.js";

const router = Router();

router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/me", requireAuth, controller.me);
router.post("/reset-password", requireAuth, controller.resetPassword);

export default router;
