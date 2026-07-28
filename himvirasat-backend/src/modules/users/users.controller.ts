import { RequestHandler } from "express";
import { UsersService, usersService } from "./users.service.js";

export class UsersController {
  constructor(
    private readonly service: UsersService = usersService
  ) {}

  getLanguageExperts: RequestHandler = async (_req, res): Promise<void> => {
    try {
      const experts = await this.service.fetchLanguageExperts();
      res.json({ success: true, experts });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch language experts" });
    }
  };

  createLanguageExpert: RequestHandler = async (req, res): Promise<void> => {
    try {
      const result = await this.service.createLanguageExpert(req.body);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(201).json({
        success: true,
        message: "Language expert created successfully",
        expert: result.expert,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create language expert" });
    }
  };

  deleteLanguageExpert: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { id } = req.body;
      if (!id) {
        res
          .status(400)
          .json({ success: false, message: "User ID is required" });
        return;
      }
      const result = await this.service.deleteLanguageExpert(id);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Language expert deactivated",
        deleted_id: id,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  getLanguageHeads: RequestHandler = async (_req, res): Promise<void> => {
    try {
      const heads = await this.service.fetchLanguageHeads();
      res.json({ success: true, heads });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch language heads" });
    }
  };

  createLanguageHead: RequestHandler = async (req, res): Promise<void> => {
    try {
      const result = await this.service.createLanguageHead(req.body);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(201).json({
        success: true,
        message: "Language head created successfully",
        head: result.head,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create language head" });
    }
  };

  deleteLanguageHead: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { id } = req.body;
      if (!id) {
        res
          .status(400)
          .json({ success: false, message: "User ID is required" });
        return;
      }
      const result = await this.service.deleteLanguageHead(id);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Language head deactivated",
        deleted_id: id,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  updateExpertDialects: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { id, dialects } = req.body;
      if (!id || !Array.isArray(dialects)) {
        res.status(400).json({
          success: false,
          message: "User ID and dialects array are required",
        });
        return;
      }
      const result = await this.service.updateExpertDialects(id, dialects);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Expert dialects updated",
        expert: result.data,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update dialects" });
    }
  };

  updateHeadDialects: RequestHandler = async (req, res): Promise<void> => {
    try {
      const { id, dialects } = req.body;
      if (!id || !Array.isArray(dialects)) {
        res.status(400).json({
          success: false,
          message: "User ID and dialects array are required",
        });
        return;
      }
      const result = await this.service.updateHeadDialects(id, dialects);
      if (!result.success) {
        res
          .status(result.statusCode ?? 500)
          .json({ success: false, message: result.message });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Head dialects updated",
        head: result.data,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update managed dialects" });
    }
  };
}

export const usersController = new UsersController();