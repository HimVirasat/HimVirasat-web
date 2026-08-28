import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";
import { AuditLogger } from "../utils/audit-logger.js";
import { AuthenticatedRequest } from "../utils/get-authenticated-user.js";
import { CODES, METHODS, BACKEND_CODE } from "@himvirasat/shared";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    requestId: res.locals.requestId,
  });
}

export async function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const requestId = res.locals.requestId as string | undefined;
  const authedReq = req as AuthenticatedRequest;
  const actorUserId = authedReq.user?.userId ?? null;

  let statusCode = 500;
  let errorMessage = "Internal server error";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorMessage = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    errorMessage = error.issues.map((i) => i.message).join(", ");
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  await AuditLogger.logError({
    action: "CLERK_WEBHOOK",
    actorUserId,
    errorMessage,
    stackTrace: error instanceof Error ? error.stack : undefined,
    serviceCategory: "auth",
    backendCode: "AUTH_CONTROLLER:FAILED_CLERK_WEBHOOK" as BACKEND_CODE,
    code: String(statusCode) as CODES,
    logStatus: "FAILED",
    path: req.originalUrl || req.path,
    method: req.method as METHODS,
    requestId,
    metadata: {
      query: req.query,
      body: req.body,
    },
  });

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    requestId,
  });
}
