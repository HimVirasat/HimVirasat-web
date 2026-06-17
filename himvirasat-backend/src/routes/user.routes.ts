import { Router } from "express";

import { getLanguageExperts } from "../handlers/user.handler.js";

import { requireAuth } from "../middlewares/auth.middleware.js";

import { requireRole } from "../middlewares/roles.middleware.js";

const router = Router();

router.get(
  "/language-experts",
  requireAuth,
  requireRole("super_admin"),
  getLanguageExperts
);

export default router;