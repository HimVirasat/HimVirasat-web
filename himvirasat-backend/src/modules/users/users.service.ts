import bcrypt from "bcrypt";
import { UsersRepository, usersRepository } from "./users.repository.js";
import {
  CreateUserPayloadFrontend,
  ServiceResult,
  SoftDeleteResult,
} from "@himvirasat/shared";
import { AuditLogger } from "../../utils/audit-logger.js";
import { SecurityContext } from "../../utils/get-authenticated-user.js";

export class UsersService {
  constructor(private readonly repository: UsersRepository = usersRepository) {}

  async fetchLanguageExperts(_ctx: SecurityContext) {
    const data = await this.repository.findUsersByRole("language_expert");
    return data;
  }

  async createLanguageExpert(
    ctx: SecurityContext,
    payload: CreateUserPayloadFrontend,
  ): Promise<ServiceResult> {
    const { fullName, email, username, password, dialects } = payload;
    const existing = await this.repository.findUserByUsername(username);

    if (existing) {
      await AuditLogger.logError({
        action: "CREATE_LANGUAGE_EXPERT",
        actorUserId: ctx.actor.id,
        errorMessage: "Username already exists",
        serviceCategory: "users",
        backendCode: "USER_SERVICE:FAILED_CREATE_LANGUAGE_EXPERT",
        code: "400",
        logStatus: "FAILED",
        metadata: { username, detailed_user: ctx.actor },
      });

      return {
        success: false,
        statusCode: 409,
        message: "Username already exists",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.repository.createUser({
      username,
      password_hash: passwordHash,
      full_name: fullName,
      email,
      role: "language_expert",
      dialects,
    });

    if (!user) {
      await AuditLogger.logError({
        action: "CREATE_LANGUAGE_EXPERT",
        actorUserId: ctx.actor.id,
        errorMessage: "Unable to create Language Expert",
        serviceCategory: "users",
        backendCode: "USER_SERVICE:FAILED_CREATE_LANGUAGE_EXPERT",
        code: "500",
        logStatus: "FAILED",
        metadata: { username, detailed_user: ctx.actor },
      });

      return {
        success: false,
        statusCode: 500,
        message: "Failed to create Language Expert",
      };
    }

    await AuditLogger.logActivity({
      action: "CREATE_LANGUAGE_EXPERT",
      entityType: "user",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "users",
      backendCode: "USER_SERVICE:SUCCESS_CREATE_LANGUAGE_EXPERT",
      logStatus: "SUCCESS",
      metadata: {
        target_id: user.id,
        username: user.username,
        detailed_user: ctx.actor,
      },
    });

    return {
      success: true,
      expert: { id: user.id, username: user.username, dialects: user.dialects },
    };
  }

  async deleteLanguageExpert(
    ctx: SecurityContext,
    id: string,
  ): Promise<SoftDeleteResult> {
    const result = await this.repository.softDeleteUser(id);

    if (result.success) {
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

  async fetchLanguageHeads(_ctx: SecurityContext) {
    const data = await this.repository.findUsersByRole("language_head");
    return data;
  }

  async createLanguageHead(
    ctx: SecurityContext,
    payload: CreateUserPayloadFrontend,
  ): Promise<ServiceResult> {
    const { fullName, email, username, password, dialects } = payload;
    const existing = await this.repository.findUserByUsername(username);

    if (existing) {
      await AuditLogger.logError({
        action: "CREATE_LANGUAGE_HEAD",
        actorUserId: ctx.actor.id,
        errorMessage: "Username already exists",
        serviceCategory: "users",
        backendCode: "USER_SERVICE:FAILED_CREATE_LANGUAGE_HEAD",
        code: "400",
        logStatus: "FAILED",
        metadata: { username, detailed_user: ctx.actor },
      });

      return {
        success: false,
        statusCode: 409,
        message: "Username already exists",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.repository.createUser({
      username,
      password_hash: passwordHash,
      full_name: fullName,
      email,
      role: "language_head",
      dialects,
    });

    if (!user) {
      await AuditLogger.logError({
        action: "CREATE_LANGUAGE_HEAD",
        actorUserId: ctx.actor.id,
        errorMessage: "Unable to create a Language Head",
        serviceCategory: "users",
        backendCode: "USER_SERVICE:FAILED_CREATE_LANGUAGE_HEAD",
        code: "500",
        logStatus: "FAILED",
        metadata: { username, detailed_user: ctx.actor },
      });

      return {
        success: false,
        statusCode: 500,
        message: "Failed to create user",
      };
    }

    await AuditLogger.logActivity({
      action: "CREATE_LANGUAGE_HEAD",
      entityType: "user",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "users",
      backendCode: "USER_SERVICE:SUCCESS_CREATE_LANGUAGE_HEAD",
      logStatus: "SUCCESS",
      metadata: {
        target_id: user.id,
        username: user.username,
        detailed_user: ctx.actor,
      },
    });

    return {
      success: true,
      head: { id: user.id, username: user.username, dialects: user.dialects },
    };
  }

  async deleteLanguageHead(
    ctx: SecurityContext,
    id: string,
  ): Promise<SoftDeleteResult> {
    const result = await this.repository.softDeleteUser(id);

    if (result.success) {
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

  async updateExpertDialects(
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

  async updateHeadDialects(
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

export const usersService = new UsersService();
