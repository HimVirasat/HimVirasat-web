import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { submissionsController } from "./submissions.controller.js";

const router = Router();

router.post("/", requireAuth, submissionsController.createSubmission);

export default router;