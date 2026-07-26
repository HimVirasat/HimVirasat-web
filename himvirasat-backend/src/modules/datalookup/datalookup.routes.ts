import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as controller from "./datalookup.controller.js";

const router = Router();
router.get("/available-dialects", requireAuth, controller.getDialects);
router.get("/available-categories", requireAuth, controller.getCategories);
router.get("/available-pos", requireAuth, controller.getPartsOfSpeech);
router.post("/generate-metadata", requireAuth, controller.generateMetadata);

export default router;