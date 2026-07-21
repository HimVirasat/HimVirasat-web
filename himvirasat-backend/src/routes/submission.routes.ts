import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { createSubmissionHandler } from "../handlers/submission.handler.js";

const router = Router();

router.post("/", requireAuth, createSubmissionHandler);

export default router;