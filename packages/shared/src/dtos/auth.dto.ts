import { z } from "zod";
import { SystemRoleSchema } from "../common/roles.js";

export const JwtUserSchema = z.object({
  userId: z.string(),
  username: z.string(),
  role: SystemRoleSchema,
});
export type JwtUser = z.infer<typeof JwtUserSchema>;

export const UserDtoSchema = z.object({
  id: z.string(),
  username: z.string(),
  full_name: z.string(),
  role: SystemRoleSchema,
  dialects: z.array(z.string()),
});
export type UserDto = z.infer<typeof UserDtoSchema>;

export const LoginRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: UserDtoSchema.optional(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;