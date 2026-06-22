import { Router } from "express";

import {
  getLanguageExperts,
  createLanguageExpert,
  deleteLanguageExpert,
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

// this is for creating the language experts via a POST.
router.post(
  "/language-experts",
  requireAuth,
  requireRole("super_admin"),
  createLanguageExpert,
);
export default router;
