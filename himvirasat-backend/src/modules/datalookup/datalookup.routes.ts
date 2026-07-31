import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/roles.middleware.js";
import { dataLookupController } from "./datalookup.controller.js";

const router = Router();

const requireLogViewerRole = requireRole("super_admin", "language_head");

router.get(
  "/available-dialects",
  requireAuth,
  dataLookupController.getDialects,
);
router.get(
  "/available-categories",
  requireAuth,
  dataLookupController.getCategories,
);
router.get(
  "/available-pos",
  requireAuth,
  dataLookupController.getPartsOfSpeech,
);
router.get(
  "/available-regions",
  requireAuth,
  dataLookupController.getAvailableRegions
);
router.get(
  "/logs/activity",
  requireAuth,
  requireLogViewerRole,
  dataLookupController.getActivityLogs,
);
router.get(
  "/logs/error",
  requireAuth,
  requireLogViewerRole,
  dataLookupController.getErrorLogs,
);
router.post(
  "/generate-metadata",
  requireAuth,
  dataLookupController.generateMetadata,
);
export default router;