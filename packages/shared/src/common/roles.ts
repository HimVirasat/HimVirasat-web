import { z } from "zod";

export const SystemRoleSchema = z.enum([
  "super_admin",
  "language_head",
  "language_expert",
  "contributor",
]);
export type SystemRole = z.infer<typeof SystemRoleSchema>;
