import { UsersRepository, usersRepository } from "../users.repository.js";
import {
  CreateUserPayloadFrontend,
  ServiceResult,
  SoftDeleteResult,
} from "@himvirasat/shared";
import { AuditLogger } from "../../../utils/audit-logger.js";
import { SecurityContext } from "../../../utils/get-authenticated-user.js";
import { clerkClient } from "../../../services/clerk.js";
import { createRoleUser } from "../users.helpers.js";

export class LanguageHeadsService {
  constructor(
    private readonly repository: UsersRepository = usersRepository,
  ) {}

  async fetch(_ctx: SecurityContext) {
    return this.repository.findUsersByRole("language_head");
  }

  async create(
    ctx: SecurityContext,
    payload: CreateUserPayloadFrontend,
  ): Promise<ServiceResult> {
    const result = await createRoleUser(
      this.repository,
      payload,
      "language_head",
    );

    if (!result.success) {
      await AuditLogger.logError({
        action: "CREATE_LANGUAGE_HEAD",
        actorUserId: ctx.actor.id,
        errorMessage: result.message ?? "Unable to create a Language Head",
        serviceCategory: "users",
        backendCode: "USER_SERVICE:FAILED_CREATE_LANGUAGE_HEAD",
        code: (String(result.statusCode ?? 500) as
          | "200"
          | "201"
          | "400"
          | "401"
          | "403"
          | "404"
          | "500"
          | "501") as any,
        logStatus: "FAILED",
        metadata: { username: payload.username, detailed_user: ctx.actor },
      });

      return result;
    }

    const head = result.head as { id?: string; username?: string } | undefined;

    await AuditLogger.logActivity({
      action: "CREATE_LANGUAGE_HEAD",
      entityType: "user",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "users",
      backendCode: "USER_SERVICE:SUCCESS_CREATE_LANGUAGE_HEAD",
      logStatus: "SUCCESS",
      metadata: {
        target_id: head?.id,
        username: head?.username,
        detailed_user: ctx.actor,
      },
    });

    return result;
  }

  async delete(ctx: SecurityContext, id: string): Promise<SoftDeleteResult> {
    const clerkUserId = await this.repository.findUserClerkId(id);
    const result = await this.repository.softDeleteUser(id);

    if (result.success) {
      if (clerkUserId) {
        await clerkClient.users.banUser(clerkUserId).catch(() => undefined);
      }

      await AuditLogger.logActivity({
        action: "DELETE_LANGUAGE_HEAD",
        entityType: "user",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "users",
        backendCode: "USER_SERVICE:SUCCESS_DELETE_LANGUAGE_HEAD",
        logStatus: "SUCCESS",
        metadata: { target_id: id, detailed_user: ctx.actor },
      });
    } else {
      await AuditLogger.logError({
        action: "DELETE_LANGUAGE_HEAD",
        actorUserId: ctx.actor.id,
        errorMessage: result.message || "Unable to delete the Language Head",
        serviceCategory: "users",
        backendCode: "USER_SERVICE:FAILED_DELETE_LANGUAGE_HEAD",
        code: "500",
        logStatus: "FAILED",
        metadata: { target_id: id, detailed_user: ctx.actor },
      });

      return {
        success: false,
        statusCode: 500,
        message: "Failed to Delete Language Head",
      };
    }

    return result;
  }

  async updateDialects(
    ctx: SecurityContext,
    id: string,
    dialects: string[],
  ): Promise<ServiceResult> {
    const updated = await this.repository.updateUserDialects(id, dialects);
    if (!updated) {
      await AuditLogger.logError({
        action: "UPDATE_HEAD_DIALECTS",
        actorUserId: ctx.actor.id,
        errorMessage: "User not found",
        serviceCategory: "users",
        backendCode: "USER_SERVICE:FAILED_UPDATE_HEAD_DIALECTS",
        code: "404",
        logStatus: "FAILED",
        metadata: {
          target_id: id,
          updatedDialects: dialects,
          detailed_user: ctx.actor,
        },
      });

      return { success: false, statusCode: 404, message: "User not found" };
    }

    await AuditLogger.logActivity({
      action: "UPDATE_HEAD_DIALECTS",
      entityType: "user",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "users",
      backendCode: "USER_SERVICE:SUCCESS_UPDATE_HEAD_DIALECTS",
      logStatus: "SUCCESS",
      metadata: {
        target_id: id,
        updatedDialects: dialects,
        detailed_user: ctx.actor,
      },
    });

    return { success: true, data: updated };
  }
}

export const languageHeadsService = new LanguageHeadsService();
