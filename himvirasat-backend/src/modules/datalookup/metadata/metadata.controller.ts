import { Response } from "express";
import { StrictAuthenticatedRequest } from "../../../utils/get-authenticated-user.js";
import { withAuth } from "../../../middlewares/controller-handler.middleware.js";
import {
  MetadataService,
  metadataService,
} from "./metadata.service.js";

export class MetadataController {
  constructor(
    private readonly service: MetadataService = metadataService,
  ) {}

  generateMetadata = withAuth(
    {
      action: "GET_ENTRIES",
      serviceCategory: "datalookup",
      backendCode: "DATALOOKUP_CONTROLLER:FAILED_GENERATE_METADATA",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const { word_devanagari, meaning_hindi, meaning_english, example_sentence } =
        req.body;

      if (!word_devanagari || typeof word_devanagari !== "string") {
        res
          .status(400)
          .json({ success: false, message: "Devanagari word is required" });
        return;
      }

      const result = await this.service.generateLinguisticMetadata(ctx, {
        word_devanagari,
        meaning_hindi,
        meaning_english,
        example_sentence,
      });

      res
        .status(200)
        .json({ success: true, model: result.model, data: result.data });
    },
  );
}

export const metadataController = new MetadataController();
