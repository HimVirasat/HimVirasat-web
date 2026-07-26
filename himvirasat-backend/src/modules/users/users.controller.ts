import { Request, Response } from "express";
import * as service from "./users.service.js";

export async function getLanguageExperts(_req: Request, res: Response) {
  try {
    const experts = await service.fetchLanguageExperts();
    return res.json({ success: true, experts });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch language experts" });
  }
}

export async function createLanguageExpert(req: Request, res: Response) {
  try {
    const result = await service.createLanguageExpert(req.body);
    if (!result.success) {
      // fallback statusCode = 500 if undefined
      return res
        .status(result.statusCode ?? 500)
        .json({ success: false, message: result.message });
    }
    return res.status(201).json({
      success: true,
      message: "Language expert created successfully",
      expert: result.expert,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create language expert" });
  }
}

export async function deleteLanguageExpert(req: Request, res: Response) {
  try {
    const { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const result = await service.deleteLanguageExpert(id);
    if (!result.success) {
      return res
        .status(result.statusCode ?? 500)
        .json({ success: false, message: result.message });
    }
    return res.status(200).json({
      success: true,
      message: "Language expert deactivated",
      deleted_id: id,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function getLanguageHeads(_req: Request, res: Response) {
  try {
    const heads = await service.fetchLanguageHeads();
    return res.json({ success: true, heads });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch language heads" });
  }
}

export async function createLanguageHead(req: Request, res: Response) {
  try {
    const result = await service.createLanguageHead(req.body);
    if (!result.success) {
      return res
        .status(result.statusCode ?? 500)
        .json({ success: false, message: result.message });
    }
    return res.status(201).json({
      success: true,
      message: "Language head created successfully",
      head: result.head,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create language head" });
  }
}

export async function deleteLanguageHead(req: Request, res: Response) {
  try {
    const { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const result = await service.deleteLanguageHead(id);
    if (!result.success) {
      return res
        .status(result.statusCode ?? 500)
        .json({ success: false, message: result.message });
    }
    return res.status(200).json({
      success: true,
      message: "Language head deactivated",
      deleted_id: id,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function updateExpertDialects(req: Request, res: Response) {
  try {
    const { id, dialects } = req.body;
    if (!id || !Array.isArray(dialects)) {
      return res.status(400).json({
        success: false,
        message: "User ID and dialects array are required",
      });
    }
    const result = await service.updateExpertDialects(id, dialects);
    if (!result.success) {
      return res
        .status(result.statusCode ?? 500)
        .json({ success: false, message: result.message });
    }
    return res.status(200).json({
      success: true,
      message: "Expert dialects updated",
      expert: result.data,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update dialects" });
  }
}

export async function updateHeadDialects(req: Request, res: Response) {
  try {
    const { id, dialects } = req.body;
    if (!id || !Array.isArray(dialects)) {
      return res.status(400).json({
        success: false,
        message: "User ID and dialects array are required",
      });
    }
    const result = await service.updateHeadDialects(id, dialects);
    if (!result.success) {
      return res
        .status(result.statusCode ?? 500)
        .json({ success: false, message: result.message });
    }
    return res.status(200).json({
      success: true,
      message: "Head dialects updated",
      head: result.data,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update managed dialects" });
  }
}
