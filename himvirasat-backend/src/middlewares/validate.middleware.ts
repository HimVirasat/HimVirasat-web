import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AuthenticatedRequest } from "../utils/get-authenticated-user.js";

interface ValidatedRequest extends AuthenticatedRequest {
  validatedBody?: unknown;
  validatedQuery?: unknown;
  validatedParams?: unknown;
}

type Source = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      _res.status(400).json({
        success: false,
        error: result.error.issues.map((i) => i.message).join(", "),
      });
      return;
    }

    const vreq = req as ValidatedRequest;
    if (source === "body") vreq.validatedBody = result.data;
    else if (source === "query") vreq.validatedQuery = result.data;
    else vreq.validatedParams = result.data;

    next();
  };
}
