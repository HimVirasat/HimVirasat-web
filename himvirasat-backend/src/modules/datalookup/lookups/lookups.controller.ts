import { Response } from "express";
import { StrictAuthenticatedRequest } from "../../../utils/get-authenticated-user.js";
import { withAuth } from "../../../middlewares/controller-handler.middleware.js";
import { AuditLogger } from "../../../utils/audit-logger.js";
import {
  LookupsService,
  lookupsService,
} from "./lookups.service.js";

export class LookupsController {
  constructor(
    private readonly service: LookupsService = lookupsService,
  ) {}

  getDialects = withAuth(
    {
      action: "GET_ENTRIES",
      serviceCategory: "datalookup",
      backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_DIALECTS",
    },
    async (_ctx, _req: StrictAuthenticatedRequest, res: Response) => {
      const data = await this.service.fetchDialects(_ctx);
      res.status(200).json({ success: true, data });
    },
  );

  getCategories = withAuth(
    {
      action: "GET_ENTRIES",
      serviceCategory: "datalookup",
      backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_CATEGORIES",
    },
    async (_ctx, _req: StrictAuthenticatedRequest, res: Response) => {
      const data = await this.service.fetchCategories(_ctx);
      res.status(200).json({ success: true, data });
    },
  );

  getPartsOfSpeech = withAuth(
    {
      action: "GET_ENTRIES",
      serviceCategory: "datalookup",
      backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_PARTS_OF_SPEECH",
    },
    async (_ctx, _req: StrictAuthenticatedRequest, res: Response) => {
      const data = await this.service.fetchPartsOfSpeech(_ctx);
      res.status(200).json({ success: true, data });
    },
  );

  getAvailableRegions = withAuth(
    {
      action: "GET_ENTRIES",
      serviceCategory: "datalookup",
      backendCode: "DATALOOKUP_CONTROLLER:FAILED_GET_ENTRIES",
    },
    async (ctx, _req: StrictAuthenticatedRequest, res: Response) => {
      const data = await this.service.fetchAvailableRegions(ctx);
      await AuditLogger.logActivity({
        actorUserId: ctx.actor.id,
        action: "GET_ENTRIES",
        backendCode: "DATALOOKUP_SERVICE:SUCCESS_GET_AVAILABLE_REGIONS",
        backendModuleCategory: "datalookup",
        entityType: "user",
        logStatus: "SUCCESS",
        metadata: { actor: ctx.actor },
      });
      res.status(200).json({ success: true, data });
    },
  );
}

export const lookupsController = new LookupsController();
