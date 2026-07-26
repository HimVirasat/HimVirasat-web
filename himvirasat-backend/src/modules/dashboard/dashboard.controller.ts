import { Request, Response } from "express";
import * as service from "./dashboard.service.js";

export async function getDashboardStats(_req: Request, res: Response) {
  try {
    const stats = await service.fetchDashboardStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch dashboard statistics",
      });
  }
}
