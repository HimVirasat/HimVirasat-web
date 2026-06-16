import {
  Request,
  Response,
  NextFunction,
} from "express";

import type {
  AuthenticatedRequest,
} from "./auth.middleware.js";

import type {
  UserRole,
} from "../types/auth.types.js";

export function requireRole(
  role: UserRole
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const user =
      (req as AuthenticatedRequest)
        .user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
}