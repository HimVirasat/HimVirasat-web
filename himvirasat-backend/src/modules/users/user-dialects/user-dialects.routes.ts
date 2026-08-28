import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import { userDialectsController } from "./user-dialects.controller.js";

const router = Router();

router.get(
  "/:identifier/dialects",
  requireAuth,
  userDialectsController.getUserDialects,
);

export default router;
