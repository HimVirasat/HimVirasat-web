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

export class LanguageExpertsService {
  constructor(
    private readonly repository: UsersRepository = usersRepository,
  ) {}

  async fetch(_ctx: SecurityContext) {
    return this.repository.findUsersByRole("language_expert");
  }

  async create(
    ctx: SecurityContext,
    payload: CreateUserPayloadFrontend,
  ): Promise<ServiceResult> {
    const result = await createRoleUser(
      this.repository,
      payload,
      "language_expert",
    );

    if (!result.success) {
      await AuditLogger.logError({
        action: "CREATE_LANGUAGE_EXPERT",
        actorUserId: ctx.actor.id,
        errorMessage: result.message ?? "Unable to create Language Expert",
        serviceCategory: "users",
        backendCode: "USER_SERVICE:FAILED_CREATE_LANGUAGE_EXPERT",
        code: String(result.statusCode ?? 500) as any,
        logStatus: "FAILED",
        metadata: { username: payload.username, detailed_user: ctx.actor },
      });

      return result;
    }

    const expert = result.expert as
      | { id?: string; username?: string }
      | undefined;

    await AuditLogger.logActivity({
      action: "CREATE_LANGUAGE_EXPERT",
      entityType: "user",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "users",
      backendCode: "USER_SERVICE:SUCCESS_CREATE_LANGUAGE_EXPERT",
      logStatus: "SUCCESS",
      metadata: {
        target_id: expert?.id,
        username: expert?.username,
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
        action: "DELETE_LANGUAGE_EXPERT",
        entityType: "user",
        actorUserId: ctx.actor.id,
        backendModuleCategory: "users",
        backendCode: "USER_SERVICE:SUCCESS_DELETE_LANGUAGE_EXPERT",
        logStatus: "SUCCESS",
        metadata: { target_id: id, detailed_user: ctx.actor },
      });
    } else {
      await AuditLogger.logError({
        action: "DELETE_LANGUAGE_EXPERT",
        actorUserId: ctx.actor.id,
        errorMessage: result.message || "Unable to delete the Language Expert",
        serviceCategory: "users",
        backendCode: "USER_SERVICE:FAILED_DELETE_LANGUAGE_EXPERT",
        code: "500",
        logStatus: "FAILED",
        metadata: { target_id: id, detailed_user: ctx.actor },
      });

      return {
        success: false,
        statusCode: 500,
        message: "Failed to Delete Language Expert",
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
        action: "UPDATE_EXPERT_DIALECTS",
        actorUserId: ctx.actor.id,
        errorMessage: "User not found",
        serviceCategory: "users",
        backendCode: "USER_SERVICE:FAILED_UPDATE_EXPERT_DIALECTS",
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
      action: "UPDATE_EXPERT_DIALECTS",
      entityType: "user",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "users",
      backendCode: "USER_SERVICE:SUCCESS_UPDATE_EXPERT_DIALECTS",
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

export const languageExpertsService = new LanguageExpertsService();
