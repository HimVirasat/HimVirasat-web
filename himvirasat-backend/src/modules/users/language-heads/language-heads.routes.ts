import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
import { requireRole } from "../../../middlewares/roles.middleware.js";
import { languageHeadsController } from "./language-heads.controller.js";

const router = Router();
const requireSuperAdmin = requireRole("super_admin");

router.get(
  "/language-heads",
  requireAuth,
  requireSuperAdmin,
  languageHeadsController.getLanguageHeads,
);
router.post(
  "/language-heads",
  requireAuth,
  requireSuperAdmin,
  languageHeadsController.createLanguageHead,
);
router.post(
  "/delete-head",
  requireAuth,
  requireSuperAdmin,
  languageHeadsController.deleteLanguageHead,
);
router.patch(
  "/language-heads/dialects",
  requireAuth,
  requireSuperAdmin,
  languageHeadsController.updateHeadDialects,
);

export default router;
