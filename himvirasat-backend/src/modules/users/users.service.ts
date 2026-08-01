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
        userId: ctx.actor.id,
        errorMessage: "Unable to create Language Expert",
        serviceCategory: "auth",
        backend_code: "USER_SERVICE:FAILED_CREATE_LANGUAGE_EXPERT",
        code: "500",
        status: "FAILED",
        metadata: { detailed_user: ctx.actor },
      });
      return {
        success: false,
        statusCode: 500,
        message: "Failed to create Language Expert",
      };
    }

    await AuditLogger.logActivity({
      actorId: ctx.actor.id,
      action: "CREATE_LANGUAGE_EXPERT",
      entityType: "user",
      entityId: user.id,
      backend_code: "USER_SERVICE:SUCCESS_CREATE_LANGUAGE_EXPERT",
      serviceCategory: "users",
      status: "SUCCESS",
      metadata: { username: user.username, detailed_user: ctx.actor },
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
        actorId: ctx.actor.id,
        action: "DELETE_LANGUAGE_EXPERT",
        backend_code: "USER_SERVICE:SUCCESS_DELETE_LANGUAGE_EXPERT",
        entityType: "user",
        entityId: id,
        serviceCategory: "users",
        status: "SUCCESS",
        metadata: { detailed_user: ctx.actor },
      });
    } else {
      await AuditLogger.logError({
        userId: ctx.actor.id,
        errorMessage: result.message || "Unable to delete the Language Expert",
        serviceCategory: "users",
        backend_code: "USER_SERVICE:FAILED_TO_DELETE_LANGUAGE_EXPERT",
        code: "500",
        status: "FAILED",
        metadata: { detailed_user: ctx.actor },
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
        userId: ctx.actor.id,
        errorMessage: "Unable to create a Language Head",
        serviceCategory: "users",
        backend_code: "USER_SERVICE:FAILED_TO_CREATE_LANGUAGE_HEAD",
        code: "500",
        status: "FAILED",
        metadata: { detailed_user: ctx.actor },
      });
      return {
        success: false,
        statusCode: 500,
        message: "Failed to create user",
      };
    }

    await AuditLogger.logActivity({
      actorId: ctx.actor.id,
      action: "CREATE_LANGUAGE_HEAD",
      entityType: "user",
      entityId: user.id,
      backend_code: "USER_SERVICE:SUCCESS_CREATE_LANGUAGE_HEAD",
      serviceCategory: "users",
      status: "SUCCESS",
      metadata: { username: user.username, detailed_user: ctx.actor },
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
        actorId: ctx.actor.id,
        action: "DELETE_LANGUAGE_HEAD",
        backend_code: "USER_SERVICE:DELETE_LANGUAGE_HEAD",
        entityType: "user",
        entityId: id,
        serviceCategory: "users",
        status: "SUCCESS",
        metadata: { detailed_user: ctx.actor },
      });
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
      return { success: false, statusCode: 404, message: "User not found" };
    }

    await AuditLogger.logActivity({
      actorId: ctx.actor.id,
      action: "UPDATE_EXPERT_DIALECTS",
      backend_code: "USER_SERVICE:SUCCESS_UPDATE_EXPERT_DIALECT",
      entityType: "user",
      entityId: id,
      serviceCategory: "users",
      status: "SUCCESS",
      metadata: { updatedDialects: dialects, detailed_user: ctx.actor },
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
      return { success: false, statusCode: 404, message: "User not found" };
    }

    await AuditLogger.logActivity({
      actorId: ctx.actor.id,
      action: "UPDATE_HEAD_DIALECTS",
      entityType: "user",
      entityId: id,
      serviceCategory: "users",
      backend_code: "USER_SERVICE:SUCCESS_UPDATE_HEAD_DIALECTS",
      status: "SUCCESS",
      metadata: { updatedDialects: dialects, detailed_user: ctx.actor },
    });

    return { success: true, data: updated };
  }
}

export const usersService = new UsersService();