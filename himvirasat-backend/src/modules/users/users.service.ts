/**
 * Users Service
 * File: users.service.ts
 */

import bcrypt from "bcrypt";
import { UsersRepository, usersRepository } from "./users.repository.js";
import {
  CreateUserPayloadFrontend,
  ServiceResult,
  SoftDeleteResult,
} from "@himvirasat/shared";
import { AuditLogger } from "../../utils/audit-logger.js";

export class UsersService {
  constructor(private readonly repository: UsersRepository = usersRepository) {}

  async fetchLanguageExperts(_actorId?: string) {
    const data = await this.repository.findUsersByRole("language_expert");

    // await AuditLogger.logActivity({
    //   actorId: actorId || null,
    //   action: "FETCH_LANGUAGE_EXPERTS",
    //   entityType: "user",
    //   serviceCategory: "users",
    //   status: "SUCCESS",
    //   metadata: { count: data.length },
    // });

    return data;
  }

  async createLanguageExpert(
    payload: CreateUserPayloadFrontend,
    actorId?: string,
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
      return {
        success: false,
        statusCode: 500,
        message: "Failed to create user",
      };
    }

    await AuditLogger.logActivity({
      actorId: actorId || null,
      action: "CREATE_LANGUAGE_EXPERT",
      entityType: "user",
      entityId: user.id,
      serviceCategory: "users",
      status: "SUCCESS",
      metadata: { username: user.username, dialects: user.dialects },
    });

    return {
      success: true,
      expert: { id: user.id, username: user.username, dialects: user.dialects },
    };
  }

  async deleteLanguageExpert(
    id: string,
    actorId?: string,
  ): Promise<SoftDeleteResult> {
    const result = await this.repository.softDeleteUser(id);

    if (result.success) {
      await AuditLogger.logActivity({
        actorId: actorId || null,
        action: "DELETE_LANGUAGE_EXPERT",
        entityType: "user",
        entityId: id,
        serviceCategory: "users",
        status: "SUCCESS",
      });
    }

    return result;
  }

  async fetchLanguageHeads(_actorId?: string) {
    const data = await this.repository.findUsersByRole("language_head");

    // await AuditLogger.logActivity({
    //   actorId: actorId || null,
    //   action: "FETCH_LANGUAGE_HEADS",
    //   entityType: "user",
    //   serviceCategory: "users",
    //   status: "SUCCESS",
    //   metadata: { count: data.length },
    // });

    return data;
  }

  async createLanguageHead(
    payload: CreateUserPayloadFrontend,
    actorId?: string,
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
      return {
        success: false,
        statusCode: 500,
        message: "Failed to create user",
      };
    }

    await AuditLogger.logActivity({
      actorId: actorId || null,
      action: "CREATE_LANGUAGE_HEAD",
      entityType: "user",
      entityId: user.id,
      serviceCategory: "users",
      status: "SUCCESS",
      metadata: { username: user.username, dialects: user.dialects },
    });

    return {
      success: true,
      head: { id: user.id, username: user.username, dialects: user.dialects },
    };
  }

  async deleteLanguageHead(
    id: string,
    actorId?: string,
  ): Promise<SoftDeleteResult> {
    const result = await this.repository.softDeleteUser(id);

    if (result.success) {
      await AuditLogger.logActivity({
        actorId: actorId || null,
        action: "DELETE_LANGUAGE_HEAD",
        entityType: "user",
        entityId: id,
        serviceCategory: "users",
        status: "SUCCESS",
      });
    }

    return result;
  }

  async updateExpertDialects(
    id: string,
    dialects: string[],
    actorId?: string,
  ): Promise<ServiceResult> {
    const updated = await this.repository.updateUserDialects(id, dialects);
    if (!updated) {
      return { success: false, statusCode: 404, message: "User not found" };
    }

    await AuditLogger.logActivity({
      actorId: actorId || null,
      action: "UPDATE_EXPERT_DIALECTS",
      entityType: "user",
      entityId: id,
      serviceCategory: "users",
      status: "SUCCESS",
      metadata: { updatedDialects: dialects },
    });

    return { success: true, data: updated };
  }

  async updateHeadDialects(
    id: string,
    dialects: string[],
    actorId?: string,
  ): Promise<ServiceResult> {
    const updated = await this.repository.updateUserDialects(id, dialects);
    if (!updated) {
      return { success: false, statusCode: 404, message: "User not found" };
    }

    await AuditLogger.logActivity({
      actorId: actorId || null,
      action: "UPDATE_HEAD_DIALECTS",
      entityType: "user",
      entityId: id,
      serviceCategory: "users",
      status: "SUCCESS",
      metadata: { updatedDialects: dialects },
    });

    return { success: true, data: updated };
  }
}

export const usersService = new UsersService();
