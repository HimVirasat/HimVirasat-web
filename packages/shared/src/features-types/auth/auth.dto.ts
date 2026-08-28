import { z } from "zod";
import { SystemRoleSchema } from "../../common/roles.js";

export const JwtUserSchema = z.object({
  userId: z.string(),
  clerkUserId: z.string().optional(),
  sessionId: z.string().optional(),
  username: z.string(),
  role: SystemRoleSchema,
});
export type JwtUser = z.infer<typeof JwtUserSchema>;

export const UserDtoSchema = z.object({
  id: z.string(),
  clerk_user_id: z.string().optional().nullable(),
  username: z.string(),
  full_name: z.string(),
  email: z.string().email().optional().nullable(),
  role: SystemRoleSchema,
  dialects: z.array(z.string()),
});
export type UserDto = z.infer<typeof UserDtoSchema>;

export const LoginRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const SignupRequestSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("A valid email is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dialects: z.array(z.string()).optional(),
});
export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: UserDtoSchema.optional(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export interface UserRecord extends UserDto {
  password_hash: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_signed_in_at?: string | null;
}
