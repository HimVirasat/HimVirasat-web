import bcrypt from "bcrypt";
import * as repository from "./auth.repository.js";
import { generateToken } from "../../utils/jwt.js";

export async function loginUser(username: string, password: string) {
  const user = await repository.findUserByUsername(username);
  if (!user) {
    return { success: false, statusCode: 401, message: "Invalid credentials" };
  }
  if (!user.is_active) {
    return { success: false, statusCode: 403, message: "Account is disabled" };
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { success: false, statusCode: 401, message: "Invalid credentials" };
  }
  const token = generateToken({ userId: user.id, username: user.username, role: user.role });
  return {
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      dialects: user.dialects,
    },
  };
}

export async function getUserProfile(userId: string) {
  const user = await repository.findUserById(userId);
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    dialects: user.dialects,
  };
}

export async function resetUserPassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await repository.findUserById(userId);
  if (!user) return { success: false, statusCode: 404, message: "User not found" };
  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) return { success: false, statusCode: 400, message: "Incorrect current password" };
  const hashed = await bcrypt.hash(newPassword, 10);
  const updated = await repository.updateUserPassword(userId, hashed);
  if (!updated) return { success: false, statusCode: 500, message: "Failed to update password" };
  return { success: true };
}