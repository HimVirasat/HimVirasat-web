import { Request, Response } from "express";
import { DatasetsService } from "./datasets.service.js";

export class DatasetsController {
  private service: DatasetsService;

  constructor() {
    this.service = new DatasetsService();
  }

  getEntries = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.service.getEntries(req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve dataset entries",
      });
    }
  };

  getEntryById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing ID parameter",
        });
      }

      const entry = await this.service.getEntryById(id);
      return res.status(200).json({
        success: true,
        data: entry,
      });
    } catch (error: any) {
      const statusCode =
        error.message === "Dataset entry not found" ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };
}
export const datasetsController = new DatasetsController();
