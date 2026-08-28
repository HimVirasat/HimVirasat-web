import { NextFunction, Request, Response } from "express";
import {
  AuthenticatedRequest,
  DetailedUser,
  StrictAuthenticatedRequest,
} from "../utils/get-authenticated-user.js";
import { AuditLogger } from "../utils/audit-logger.js";
import {
  ACTION,
  BACKEND_CODE,
  BACKEND_MODULE_CATEGORIES,
  CODES,
  METHODS,
} from "@himvirasat/shared";

export type AuthedHandler = (
  ctx: { actor: DetailedUser },
  req: StrictAuthenticatedRequest,
  res: Response,
) => Promise<void>;

interface HandlerOptions {
  action: ACTION;
  serviceCategory: BACKEND_MODULE_CATEGORIES;
  backendCode: BACKEND_CODE;
  failStatusCode?: CODES;
}

function isAuthedRequest(req: Request): req is StrictAuthenticatedRequest {
  return Boolean(
    (req as AuthenticatedRequest)._cachedUser &&
      (req as AuthenticatedRequest).user,
  );
}

/**
 * Wraps an authenticated handler, resolving the cached security context and
 * standardizing 401 handling + error logging. Controllers become thin by
 * delegating the auth/error boilerplate to this HOF.
 */
export function withAuth(options: HandlerOptions, handler: AuthedHandler) {
  return async (req: Request, res: Response, _next: NextFunction) => {
    if (!isAuthedRequest(req)) {
      res.status(401).json({
        success: false,
        error: "Authentication or user profile missing.",
      });
      return;
    }

    const ctx = { actor: req._cachedUser };
    const failStatusCode = options.failStatusCode ?? "500";

    try {
      await handler(ctx, req, res);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      await AuditLogger.logError({
        action: options.action,
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error instanceof Error ? error.stack : undefined,
        serviceCategory: options.serviceCategory,
        backendCode: options.backendCode,
        code: failStatusCode,
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: req.method as METHODS,
        requestId: res.locals.requestId,
        metadata: {
          query: req.query,
          params: req.params,
          body: req.body,
          actor: ctx.actor,
        },
      });

      res
        .status(Number(failStatusCode))
        .json({ success: false, error: errorMessage });
    }
  };
}
