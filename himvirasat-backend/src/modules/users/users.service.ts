import bcrypt from "bcrypt";
import {
  UsersRepository,
  usersRepository,
} from "./users.repository.js";
import {
  CreateUserPayloadFrontend,
  ServiceResult,
  SoftDeleteResult,
} from "@himvirasat/shared";

export class UsersService {
  constructor(
    private readonly repository: UsersRepository = usersRepository
  ) { }

  async fetchLanguageExperts() {
    return this.repository.findUsersByRole("language_expert");
  }

  async createLanguageExpert(
    payload: CreateUserPayloadFrontend
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

    return {
      success: true,
      expert: { id: user.id, username: user.username, dialects: user.dialects },
    };
  }

  async deleteLanguageExpert(id: string): Promise<SoftDeleteResult> {
    return this.repository.softDeleteUser(id);
  }

  async fetchLanguageHeads() {
    return this.repository.findUsersByRole("language_head");
  }

  async createLanguageHead(
    payload: CreateUserPayloadFrontend
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

    return {
      success: true,
      head: { id: user.id, username: user.username, dialects: user.dialects },
    };
  }

  async deleteLanguageHead(id: string): Promise<SoftDeleteResult> {
    return this.repository.softDeleteUser(id);
  }

  async updateExpertDialects(
    id: string,
    dialects: string[]
  ): Promise<ServiceResult> {
    const updated = await this.repository.updateUserDialects(id, dialects);
    if (!updated) {
      return { success: false, statusCode: 404, message: "User not found" };
    }
    return { success: true, data: updated };
  }

  async updateHeadDialects(
    id: string,
    dialects: string[]
  ): Promise<ServiceResult> {
    const updated = await this.repository.updateUserDialects(id, dialects);
    if (!updated) {
      return { success: false, statusCode: 404, message: "User not found" };
    }
    return { success: true, data: updated };
  }
}

export const usersService = new UsersService();