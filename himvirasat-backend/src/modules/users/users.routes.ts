import { Router } from "express";
import languageExpertsRouter from "./language-experts/language-experts.routes.js";
import languageHeadsRouter from "./language-heads/language-heads.routes.js";
import userDialectsRouter from "./user-dialects/user-dialects.routes.js";

const router = Router();

router.use(languageExpertsRouter);
router.use(languageHeadsRouter);
router.use(userDialectsRouter);

export default router;
