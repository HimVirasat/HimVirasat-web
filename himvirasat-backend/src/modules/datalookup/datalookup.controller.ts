import { Request, Response } from "express";
import * as service from "./datalookup.service.js";

export async function getDialects(_req: Request, res: Response) {
  try {
    const data = await service.fetchDialects();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve dialects" });
  }
}

export async function getCategories(_req: Request, res: Response) {
  try {
    const data = await service.fetchCategories();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve categories" });
  }
}

export async function getPartsOfSpeech(_req: Request, res: Response) {
  try {
    const data = await service.fetchPartsOfSpeech();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve parts of speech" });
  }
}

export async function generateMetadata(req: Request, res: Response) {
  try {
    const {
      word_devanagari,
      meaning_hindi,
      meaning_english,
      example_sentence,
    } = req.body;
    if (!word_devanagari) {
      return res
        .status(400)
        .json({ success: false, message: "Devanagari word is required" });
    }
    const result = await service.generateLinguisticMetadata({
      word_devanagari,
      meaning_hindi,
      meaning_english,
      example_sentence,
    });
    return res
      .status(200)
      .json({ success: true, model: result.model, data: result.data });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate metadata",
    });
  }
}
