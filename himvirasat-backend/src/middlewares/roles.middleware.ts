import { Request, Response, NextFunction } from "express";
import { SystemRole } from "@himvirasat/shared";
import type { AuthenticatedRequest } from "./auth.middleware.js";

export function requireRole(...roles: SystemRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
}
