import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/roles.middleware.js";
import * as controller from "./users.controller.js";

const router = Router();

// Language Experts
router.get(
  "/language-experts",
  requireAuth,
  requireRole("super_admin", "language_head"),
  controller.getLanguageExperts,
);
router.post(
  "/language-experts",
  requireAuth,
  requireRole("super_admin", "language_head"),
  controller.createLanguageExpert,
);
router.post(
  "/delete-expert",
  requireAuth,
  requireRole("super_admin", "language_head"),
  controller.deleteLanguageExpert,
);
router.patch(
  "/language-experts/dialects",
  requireAuth,
  requireRole("super_admin", "language_head"),
  controller.updateExpertDialects,
);

// Language Heads
router.get(
  "/language-heads",
  requireAuth,
  requireRole("super_admin"),
  controller.getLanguageHeads,
);
router.post(
  "/language-heads",
  requireAuth,
  requireRole("super_admin"),
  controller.createLanguageHead,
);
router.post(
  "/delete-head",
  requireAuth,
  requireRole("super_admin"),
  controller.deleteLanguageHead,
);
router.patch(
  "/language-heads/dialects",
  requireAuth,
  requireRole("super_admin"),
  controller.updateHeadDialects,
);

export default router;
