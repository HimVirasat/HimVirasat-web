import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import {
  getAuthenticatedUser,
  AuthenticatedRequest,
} from "../utils/get-authenticated-user.js";
import type { JwtUser } from "@himvirasat/shared";

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Missing authentication token",
      });
      return;
    }

    const payload = verifyToken(token) as JwtUser;
    if (!payload?.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token payload",
      });
      return;
    }

    req.user = payload;

    const userProfile = await getAuthenticatedUser(req);

    if (!userProfile) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Active user profile not found",
      });
      return;
    }

    if (!userProfile.is_active) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Account has been deactivated",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
    return;
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.access_token;
    if (token) {
      const payload = verifyToken(token) as JwtUser;
      if (payload?.userId) {
        req.user = payload;
        await getAuthenticatedUser(req);
      }
    }
  } catch {
    req.user = undefined;
    req._cachedUser = undefined;
  }

  next();
}
