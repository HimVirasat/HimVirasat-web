import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/roles.middleware.js";
import { usersController } from "./users.controller.js";

const router = Router();

// Language Experts
router.get(
  "/language-experts",
  requireAuth,
  requireRole("super_admin", "language_head"),
  usersController.getLanguageExperts,
);
router.post(
  "/language-experts",
  requireAuth,
  requireRole("super_admin", "language_head"),
  usersController.createLanguageExpert,
);
router.post(
  "/delete-expert",
  requireAuth,
  requireRole("super_admin", "language_head"),
  usersController.deleteLanguageExpert,
);
router.patch(
  "/language-experts/dialects",
  requireAuth,
  requireRole("super_admin", "language_head"),
  usersController.updateExpertDialects,
);

// Language Heads
router.get(
  "/language-heads",
  requireAuth,
  requireRole("super_admin"),
  usersController.getLanguageHeads,
);
router.post(
  "/language-heads",
  requireAuth,
  requireRole("super_admin"),
  usersController.createLanguageHead,
);
router.post(
  "/delete-head",
  requireAuth,
  requireRole("super_admin"),
  usersController.deleteLanguageHead,
);
router.patch(
  "/language-heads/dialects",
  requireAuth,
  requireRole("super_admin"),
  usersController.updateHeadDialects,
);
router.get(
  "/:identifier/dialects",
  requireAuth,
  usersController.getUserDialects,
);

export default router;
