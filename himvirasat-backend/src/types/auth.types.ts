export type UserRole = "super_admin" | "language_head" | "language_expert";

export interface JwtUser {
  userId: string;
  username: string;
  role: UserRole;
}

export interface UserDto {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  dialects: string[];
}

export interface User {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  email: string | null;
  role: UserRole;
  dialects: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserDto;
}
