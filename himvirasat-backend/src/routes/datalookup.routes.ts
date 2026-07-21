import { Router } from "express";

import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  getDialectsHandler,
  getCategoriesHandler,
  getPartsOfSpeechHandler,
} from "../handlers/datalookup.handler.js";
import { generateMetadataHandler } from "../handlers/llm.handler.js";
const router = Router();

router.get("/available-dialects", requireAuth, getDialectsHandler);
router.get("/available-categories", requireAuth, getCategoriesHandler);
router.get("/available-pos", requireAuth, getPartsOfSpeechHandler);
router.post("/generate-metadata", requireAuth, generateMetadataHandler);
export default router;
