import { z } from "zod";

export const SystemRoleSchema = z.enum([
  "super_admin",
  "language_head",
  "language_expert",
  "contributor",
]);
export type SystemRole = z.infer<typeof SystemRoleSchema>;

export const ADMIN_ROLES: readonly SystemRole[] = [
  "super_admin",
  "language_head",
  "language_expert",
];

export const ADMIN_ROLE_SET: ReadonlySet<SystemRole> = new Set(ADMIN_ROLES);

export const CONTRIBUTOR_ROLE: SystemRole = "contributor";

export function isAdminRole(role: SystemRole | null | undefined): boolean {
  return !!role && ADMIN_ROLE_SET.has(role);
}

export function isContributorRole(role: SystemRole | null | undefined): boolean {
  return role === CONTRIBUTOR_ROLE;
}

/**
 * Returns the dashboard path a role should land on after sign-in.
 */
export function getDashboardPathForRole(
  role: SystemRole | null | undefined,
): "/admin" | "/user" {
  return isAdminRole(role) ? "/admin" : "/user";
}

/**
 * Parses a raw role value (from Clerk publicMetadata claims, request bodies, etc.)
 * and safely coerces it to a valid SystemRole, defaulting to `contributor`.
 */
export function coerceSystemRole(value: unknown): SystemRole {
  const parsed = SystemRoleSchema.safeParse(value);
  return parsed.success ? parsed.data : CONTRIBUTOR_ROLE;
}
