import { Request, Response } from "express";
import { Webhook } from "svix";

import { env } from "../../config/env.js";
import {
  AuthenticatedRequest,
  StrictAuthenticatedRequest,
  SecurityContext,
  getAuthenticatedUser,
} from "../../utils/get-authenticated-user.js";
import { AuditLogger } from "../../utils/audit-logger.js";
import { AuthService, authService } from "./auth.service.js";

type ClerkWebhookPayload = {
  type: string;
  data?: {
    id?: string;
  };
};

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  private getSecurityContext(req: StrictAuthenticatedRequest): SecurityContext {
    return {
      actor: req._cachedUser,
    };
  }

  me = async (req: Request, res: Response) => {
    const cachedUser = await getAuthenticatedUser(req as AuthenticatedRequest);
    if (!cachedUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authReq = req as StrictAuthenticatedRequest;
    const ctx = this.getSecurityContext(authReq);

    try {
      const user = await this.service.getUserProfile(ctx);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({ success: true, user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      await AuditLogger.logError({
        action: "ME",
        actorUserId: ctx.actor.id,
        errorMessage,
        stackTrace: error instanceof Error ? error.stack : undefined,
        serviceCategory: "auth",
        backendCode: "AUTH_CONTROLLER:FAILED_ME",
        code: "500",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "GET",
        metadata: { detailed_user: ctx.actor },
      });

      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  clerkWebhook = async (req: Request, res: Response) => {
    if (!env.CLERK_WEBHOOK_SECRET) {
      return res.status(503).json({
        success: false,
        message: "Clerk webhook secret is not configured",
      });
    }

    const svixId = req.get("svix-id");
    const svixTimestamp = req.get("svix-timestamp");
    const svixSignature = req.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Svix webhook headers",
      });
    }

    try {
      const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);
      const body = Buffer.isBuffer(req.body)
        ? req.body.toString("utf8")
        : JSON.stringify(req.body);

      const event = webhook.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookPayload;

      const clerkUserId = event.data?.id;
      if (!clerkUserId) {
        return res.status(202).json({ success: true });
      }

      if (event.type === "user.deleted") {
        await this.service.deactivateClerkUser(clerkUserId);
      } else if (event.type === "user.created" || event.type === "user.updated") {
        await this.service.syncClerkUserById(clerkUserId);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid Clerk webhook";

      await AuditLogger.logError({
        action: "CLERK_WEBHOOK",
        actorUserId: null,
        errorMessage,
        stackTrace: error instanceof Error ? error.stack : undefined,
        serviceCategory: "auth",
        backendCode: "AUTH_CONTROLLER:FAILED_CLERK_WEBHOOK",
        code: "400",
        logStatus: "FAILED",
        path: req.originalUrl || req.path,
        method: "POST",
      });

      return res.status(400).json({ success: false, message: errorMessage });
    }
  };

  deprecatedLocalAuth = async (_req: Request, res: Response) => {
    return res.status(410).json({
      success: false,
      message: "Password auth is managed by Clerk. Use Clerk sign-in instead.",
    });
  };
}

export const authController = new AuthController();
