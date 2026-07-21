import { Router } from "express";

import {
  getLanguageExperts,
  createLanguageExpert,
  deleteLanguageExpert,
  getLanguageHeads,
  createLanguageHead,
  deleteLanguageHead,
  updateExpertDialects,
  updateHeadDialects,
} from "../handlers/user.handler.js";

import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/roles.middleware.js";

const router = Router();

router.get(
  "/language-experts",
  requireAuth,
  requireRole("super_admin", "language_head"),
  getLanguageExperts,
);

router.post(
  "/delete-expert",
  requireAuth,
  requireRole("super_admin", "language_head"),
  deleteLanguageExpert,
);

router.post(
  "/language-experts",
  requireAuth,
  requireRole("super_admin", "language_head"),
  createLanguageExpert,
);

router.get(
  "/language-heads",
  requireAuth,
  requireRole("super_admin"),
  getLanguageHeads,
);

router.post(
  "/delete-head",
  requireAuth,
  requireRole("super_admin"),
  deleteLanguageHead,
);

router.post(
  "/language-heads",
  requireAuth,
  requireRole("super_admin"),
  createLanguageHead,
);

router.patch(
  "/language-experts/dialects",
  requireAuth,
  requireRole("super_admin", "language_head"),
  updateExpertDialects,
);

router.patch(
  "/language-heads/dialects",
  requireAuth,
  requireRole("super_admin"),
  updateHeadDialects,
);

export default router;