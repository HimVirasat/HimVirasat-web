import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { dataLookupController } from "./datalookup.controller.js";

const router = Router();

router.get("/available-dialects", requireAuth, dataLookupController.getDialects);
router.get("/available-categories", requireAuth, dataLookupController.getCategories);
router.get("/available-pos", requireAuth, dataLookupController.getPartsOfSpeech);
router.post("/generate-metadata", requireAuth, dataLookupController.generateMetadata);

export default router;