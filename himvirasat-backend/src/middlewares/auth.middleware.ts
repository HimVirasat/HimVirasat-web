import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import {
  getAuthenticatedUser,
  AuthenticatedRequest,
} from "../utils/get-authenticated-user.js";
import type { JwtUser } from "@himvirasat/shared";

/**
 * Strict Authentication & User Hydration Middleware
 * Guarantees that downstream controllers receive a populated req.user and req._cachedUser.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized: Missing authentication token" });
      return;
    }

    // 1. Verify JWT payload
    const payload = verifyToken(token) as JwtUser;
    if (!payload?.userId) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token payload" });
      return;
    }

    req.user = payload;

    // 2. Hydrate detailed user profile into req._cachedUser via Supabase
    const userProfile = await getAuthenticatedUser(req);

    if (!userProfile) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized: Active user profile not found" });
      return;
    }

    if (!userProfile.is_active) {
      res
        .status(403)
        .json({ success: false, message: "Forbidden: Account has been deactivated" });
      return;
    }

    // At this point, req safely satisfies StrictAuthenticatedRequest
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized: Invalid or expired token" });
    return;
  }
}

/**
 * Optional Authentication Middleware
 * Hydrates req._cachedUser if a valid token is present, but allows the request to proceed if unauthenticated.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
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
    // Ignore invalid tokens for optional auth and proceed as guest
    req.user = undefined;
    req._cachedUser = undefined;
  }

  next();
}