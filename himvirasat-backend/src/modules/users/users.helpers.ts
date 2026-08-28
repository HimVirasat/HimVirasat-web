import {
  CreateUserPayloadFrontend,
  ServiceResult,
  SystemRole,
} from "@himvirasat/shared";
import { clerkClient } from "../../services/clerk.js";
import { UsersRepository } from "./users.repository.js";

export function normalizeUsername(
  username: string | undefined | null,
): string {
  return (
    (username ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 48) || ""
  );
}

export async function createRoleUser(
  repository: UsersRepository,
  payload: CreateUserPayloadFrontend,
  role: Extract<SystemRole, "language_head" | "language_expert">,
): Promise<ServiceResult> {
  const { fullName, email, password, dialects = [] } = payload;
  const username = normalizeUsername(payload.username);

  if (!fullName?.trim()) {
    return {
      success: false,
      statusCode: 400,
      message: "Full name is required",
    };
  }

  if (!username) {
    return {
      success: false,
      statusCode: 400,
      message: "Username is required",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      statusCode: 400,
      message: "Clerk passwords must be at least 8 characters",
    };
  }

  const existingUsername = await repository.findUserByUsername(username);
  if (existingUsername) {
    return {
      success: false,
      statusCode: 409,
      message: "Username already exists",
    };
  }

  const existingEmail = await repository.findUserByEmail(email);
  if (existingEmail) {
    return {
      success: false,
      statusCode: 409,
      message: "Email already exists",
    };
  }

  const { firstName, lastName } = splitFullName(fullName);
  const clerkUserPayload = {
    emailAddress: [email],
    password,
    skipLegalChecks: true,
    publicMetadata: {
      himvirasatRole: role,
      dialects,
    },
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
  };

  let clerkUser;
  try {
    clerkUser = await clerkClient.users.createUser(clerkUserPayload);
  } catch (error: any) {
    const message =
      error?.errors?.[0]?.longMessage ??
      error?.errors?.[0]?.message ??
      error?.message ??
      "Unable to create the Clerk account";

    return {
      success: false,
      statusCode: 400,
      message,
    };
  }

  try {
    const user = await repository.createUser({
      clerk_user_id: clerkUser.id,
      username,
      password_hash: `clerk_managed:${clerkUser.id}`,
      full_name: fullName,
      email,
      role,
      dialects,
    });

    const userSummary = {
      id: user.id,
      clerk_user_id: user.clerk_user_id,
      username: user.username,
      dialects: user.dialects,
    };

    return role === "language_head"
      ? { success: true, head: userSummary }
      : { success: true, expert: userSummary };
  } catch (error) {
    await clerkClient.users.deleteUser(clerkUser.id).catch(() => undefined);
    throw error;
  }
}

export function splitFullName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" ") || undefined,
  };
}
