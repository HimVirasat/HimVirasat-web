import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/roles.middleware.js";
import { languageExpertsController } from "./language-experts.controller.js";

const router = Router();
const requireManager = requireRole("super_admin", "language_head");

router.get(
  "/language-experts",
  requireAuth,
  requireManager,
  languageExpertsController.getLanguageExperts,
);
router.post(
  "/language-experts",
  requireAuth,
  requireManager,
  languageExpertsController.createLanguageExpert,
);
router.post(
  "/delete-expert",
  requireAuth,
  requireManager,
  languageExpertsController.deleteLanguageExpert,
);
router.patch(
  "/language-experts/dialects",
  requireAuth,
  requireManager,
  languageExpertsController.updateExpertDialects,
);

export default router;
