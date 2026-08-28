import { Response } from "express";
import { StrictAuthenticatedRequest } from "../../../utils/get-authenticated-user.js";
import { withAuth } from "../../../middlewares/controller-handler.middleware.js";
import {
  UserDialectsService,
  userDialectsService,
} from "./user-dialects.service.js";

export class UserDialectsController {
  constructor(
    private readonly service: UserDialectsService = userDialectsService,
  ) {}

  getUserDialects = withAuth(
    {
      action: "GET_DIALECTS",
      serviceCategory: "users",
      backendCode: "USER_CONTROLLER:FAILED_GET_DIALECTS",
    },
    async (ctx, req: StrictAuthenticatedRequest, res: Response) => {
      const rawIdentifier = req.params.identifier || req.params.id;
      let identifier = Array.isArray(rawIdentifier)
        ? rawIdentifier[0]
        : rawIdentifier;

      if (!identifier) {
        res.status(400).json({
          success: false,
          error: "Missing user identifier parameter.",
        });
        return;
      }

      if (identifier === "me") {
        identifier = ctx.actor.id || ctx.actor.username;
        if (!identifier) {
          res.status(401).json({
            success: false,
            error: "Unauthorized session context.",
          });
          return;
        }
      }

      const dialects = await this.service.getDialects(identifier);

      if (!dialects) {
        res.status(404).json({
          success: false,
          error: "User not found or has no assigned dialects.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          identifier,
          dialects,
        },
      });
    },
  );
}

export const userDialectsController = new UserDialectsController();
