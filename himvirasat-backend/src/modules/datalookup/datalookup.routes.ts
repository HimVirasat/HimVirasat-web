import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { dataLookupController } from "./datalookup.controller.js";

const router = Router();

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
  "/logs/activity",
  requireAuth,
  dataLookupController.getActivityLogs,
);
router.get(
  "/logs/error",
  requireAuth,
  dataLookupController.getErrorLogs,
);
router.post(
  "/generate-metadata",
  requireAuth,
  dataLookupController.generateMetadata,
);

export default router;