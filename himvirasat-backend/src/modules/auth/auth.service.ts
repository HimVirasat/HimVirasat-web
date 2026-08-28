import type { User as ClerkUser } from "@clerk/backend";
import {
  SystemRoleSchema,
  type SystemRole,
  type UserDto,
  type UserRecord,
} from "@himvirasat/shared";

import { clerkClient } from "../../services/clerk.js";
import { AuditLogger } from "../../utils/audit-logger.js";
import { SecurityContext } from "../../utils/get-authenticated-user.js";
import { AuthRepository, authRepository } from "./auth.repository.js";

const CLERK_MANAGED_PASSWORD_HASH_PREFIX = "clerk_managed";

type ClerkUserLike = Pick<
  ClerkUser,
  | "id"
  | "username"
  | "firstName"
  | "lastName"
  | "emailAddresses"
  | "primaryEmailAddressId"
  | "lastSignInAt"
  | "publicMetadata"
>;

interface ClerkSyncOptions {
  role?: SystemRole;
}

export class AuthService {
  constructor(private readonly repository: AuthRepository = authRepository) {}

  async syncClerkUserById(
    clerkUserId: string,
    options: ClerkSyncOptions = {},
  ): Promise<UserRecord> {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    return this.syncClerkUser(clerkUser, options);
  }

  async syncClerkUser(
    clerkUser: ClerkUserLike,
    options: ClerkSyncOptions = {},
  ): Promise<UserRecord> {
    const email = this.getPrimaryEmail(clerkUser);
    const username = this.getUsername(clerkUser);
    const fullName = this.getFullName(clerkUser, email, username);
    const lastSignedInAt = clerkUser.lastSignInAt
      ? new Date(clerkUser.lastSignInAt).toISOString()
      : null;
    const role = options.role ?? this.getInitialRole(clerkUser);

    // Ensure the Clerk user's public metadata always carries a role. Runs on
    // every sync (create or update) so a missing `himvirasatRole` — e.g. a
    // self-signed-up account — is backfilled to `contributor` and stays the
    // source of truth for RBAC claims before an admin promotes the user.
    await this.ensureRoleInClerkMetadata(clerkUser, role);

    const existingByClerkId = await this.repository.findByClerkUserId(
      clerkUser.id,
    );

    if (existingByClerkId) {
      return this.repository.updateUser(existingByClerkId.id, {
        username,
        full_name: fullName,
        email,
        ...(options.role ? { role: options.role } : {}),
        last_signed_in_at: lastSignedInAt,
      });
    }

    const existingByEmail = email
      ? await this.repository.findByEmail(email)
      : null;

    if (existingByEmail) {
      return this.repository.updateUser(existingByEmail.id, {
        clerk_user_id: clerkUser.id,
        username,
        full_name: fullName,
        email,
        ...(options.role ? { role: options.role } : {}),
        last_signed_in_at: lastSignedInAt,
      });
    }

    const uniqueUsername = await this.getUniqueUsername(username);
    const dialects = this.getInitialDialects(clerkUser);

    const user = await this.repository.createUser({
      clerk_user_id: clerkUser.id,
      username: uniqueUsername,
      password_hash: `${CLERK_MANAGED_PASSWORD_HASH_PREFIX}:${clerkUser.id}`,
      full_name: fullName,
      email,
      role,
      dialects,
    });

    await AuditLogger.logActivity({
      action: "CLERK_USER_SYNC",
      entityType: "user",
      actorUserId: user.id,
      backendModuleCategory: "auth",
      backendCode: "AUTH_SERVICE:SUCCESS_CLERK_USER_SYNC",
      logStatus: "SUCCESS",
      metadata: {
        target_id: user.id,
        clerk_user_id: clerkUser.id,
        username: user.username,
        role: user.role,
      },
    });

    return user;
  }

  async deactivateClerkUser(clerkUserId: string): Promise<void> {
    const user = await this.repository.findByClerkUserId(clerkUserId);
    if (!user) return;

    await this.repository.updateUser(user.id, {
      is_active: false,
      email: user.email ? `deleted_${Date.now()}_${user.email}` : null,
      username: `deleted_hv_${Date.now()}`,
    });
  }

  async getUserProfile(ctx: SecurityContext): Promise<UserDto | null> {
    const user = await this.repository.findById(ctx.actor.id);
    if (!user) return null;

    return this.toUserDto(user);
  }

  toUserDto(user: UserRecord): UserDto {
    return {
      id: user.id,
      clerk_user_id: user.clerk_user_id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      dialects: user.dialects,
    };
  }

  private getPrimaryEmail(user: ClerkUserLike): string | null {
    const primaryEmail = user.emailAddresses.find(
      (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
    );

    return primaryEmail?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  }

  private getUsername(user: ClerkUserLike): string {
    const email = this.getPrimaryEmail(user);
    const base =
      user.username ??
      email?.split("@")[0] ??
      this.randomUsername(user.id);

    return base
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 48) || this.randomUsername(user.id);
  }

  private randomUsername(correlate?: string): string {
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    const rand = Array.from(
      { length: 8 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");
    const suffix = correlate
      ? correlate.replace(/^user_/, "").slice(0, 6)
      : "";
    return `user_${rand}${suffix}`.toLowerCase();
  }

  private getFullName(
    user: ClerkUserLike,
    email: string | null,
    username: string,
  ): string {
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return name || user.username || email || username;
  }

  private getInitialRole(user: ClerkUserLike) {
    const parsed = SystemRoleSchema.safeParse(
      user.publicMetadata?.himvirasatRole ?? user.publicMetadata?.role,
    );

    return parsed.success ? parsed.data : "contributor";
  }

  /**
   * Writes the resolved role into the Clerk user's public metadata if it is not
   * already present. Keeps Clerk metadata in sync with our RBAC defaults so the
   * frontend `/post-login` fallback and any claim-based checks see a role.
   */
  private async ensureRoleInClerkMetadata(
    user: ClerkUserLike,
    role: SystemRole,
  ): Promise<void> {
    const existing =
      user.publicMetadata?.himvirasatRole ?? user.publicMetadata?.role;

    if (existing && SystemRoleSchema.safeParse(existing).success) {
      return;
    }

    try {
      await clerkClient.users.updateUser(user.id, {
        publicMetadata: {
          ...user.publicMetadata,
          himvirasatRole: role,
        },
      });
    } catch (error) {
      console.error(
        "[AuthService] Failed to default publicMetadata role:",
        error,
      );
    }
  }

  private getInitialDialects(user: ClerkUserLike): string[] {
    const dialects = user.publicMetadata?.dialects;
    return Array.isArray(dialects)
      ? dialects.filter((dialect): dialect is string => typeof dialect === "string")
      : [];
  }

  private async getUniqueUsername(username: string) {
    let candidate = username;
    let suffix = 1;

    while (await this.repository.findByUsername(candidate)) {
      candidate = `${username}_${suffix}`;
      suffix += 1;
    }

    return candidate;
  }
}

export const authService = new AuthService();
