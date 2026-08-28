import { verifyToken } from "@clerk/backend";
import { Response, NextFunction } from "express";
import {
  SystemRoleSchema,
  type JwtUser,
  type SystemRole,
  type UserRecord,
} from "@himvirasat/shared";

import { env } from "../config/env.js";
import { authRepository } from "../modules/auth/auth.repository.js";
import { authService } from "../modules/auth/auth.service.js";
import {
  getAuthenticatedUser,
  AuthenticatedRequest,
} from "../utils/get-authenticated-user.js";

function getBearerToken(req: AuthenticatedRequest): string | null {
  const authorization = req.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return req.cookies?.__session ?? null;
}

function getAuthorizedParties() {
  const configured = env.CLERK_AUTHORIZED_PARTIES?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configured?.length
    ? configured
    : ["http://localhost:3000", env.FRONTEND_URL].filter(
        (origin): origin is string => Boolean(origin),
      );
}

type ClerkJwtPayload = {
  sub?: string;
  sid?: unknown;
} & Record<string, unknown>;

async function verifyClerkSessionToken(
  token: string,
): Promise<ClerkJwtPayload> {
  const options = {
    secretKey: env.CLERK_SECRET_KEY,
    authorizedParties: getAuthorizedParties(),
    ...(env.CLERK_JWT_KEY ? { jwtKey: env.CLERK_JWT_KEY } : {}),
  };

  return verifyToken(token, options) as Promise<ClerkJwtPayload>;
}

async function hydrateRequestUser(
  req: AuthenticatedRequest,
  payload: ClerkJwtPayload,
) {
  if (!payload.sub) return null;

  const role = getRoleFromClaims(payload);

  // Fast path: resolve the local profile by Clerk user id without an extra
  // Clerk API round-trip (avoids rate limits and latency on every request).
  let user: UserRecord | null =
    await authRepository.findByClerkUserId(payload.sub);

  // Slow path: first time we see this Clerk user -> sync/create the local row.
  if (!user) {
    user = await authService.syncClerkUserById(
      payload.sub,
      role ? { role } : {},
    );
  }

  const jwtUser: JwtUser = {
    userId: user.id,
    clerkUserId: payload.sub,
    sessionId: typeof payload.sid === "string" ? payload.sid : undefined,
    username: user.username,
    role: user.role,
  };

  req.user = jwtUser;

  return getAuthenticatedUser(req);
}

function getRoleFromClaims(claims: Record<string, unknown>): SystemRole | undefined {
  const candidates = [
    claims.himvirasatRole,
    claims.role,
    getNestedClaim(claims, "metadata", "role"),
    getNestedClaim(claims, "metadata", "himvirasatRole"),
    getNestedClaim(claims, "publicMetadata", "role"),
    getNestedClaim(claims, "publicMetadata", "himvirasatRole"),
  ];

  for (const candidate of candidates) {
    const parsed = SystemRoleSchema.safeParse(candidate);
    if (parsed.success) return parsed.data;
  }

  return undefined;
}

function getNestedClaim(
  claims: Record<string, unknown>,
  key: string,
  nestedKey: string,
) {
  const value = claims[key];
  if (!value || typeof value !== "object") return undefined;

  return (value as Record<string, unknown>)[nestedKey];
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = getBearerToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Missing Clerk session token",
      });
      return;
    }

    const payload = await verifyClerkSessionToken(token);
    const userProfile = await hydrateRequestUser(req, payload);

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
  } catch {
    res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired Clerk session",
    });
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = getBearerToken(req);
    if (token) {
      const payload = await verifyClerkSessionToken(token);
      await hydrateRequestUser(req, payload);
    }
  } catch {
    req.user = undefined;
    req._cachedUser = undefined;
  }

  next();
}
