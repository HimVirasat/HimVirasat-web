import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as controller from "./submissions.controller.js";

const router = Router();
router.post("/", requireAuth, controller.createSubmission);
export default router;