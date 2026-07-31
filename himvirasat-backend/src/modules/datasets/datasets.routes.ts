import { Router } from "express";
import { datasetsController } from "./datasets.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public / Authenticated read routes
router.get("/", requireAuth, datasetsController.getEntries);
router.get("/:id", requireAuth, datasetsController.getEntryById);

export default router;
