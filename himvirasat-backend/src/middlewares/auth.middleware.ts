import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import type { JwtUser } from "@himvirasat/shared";

export interface AuthenticatedRequest extends Request {
  user?: JwtUser;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const payload = verifyToken(token) as JwtUser;
    (req as AuthenticatedRequest).user = payload;

    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}
