import bcrypt from "bcrypt";
import * as repository from "./users.repository.js";

export async function fetchLanguageExperts() {
  return repository.findUsersByRole("language_expert");
}

export async function createLanguageExpert(payload: any) {
  const { fullName, email, username, password, dialects } = payload;
  const existing = await repository.findUserByUsername(username);
  if (existing) {
    return { success: false, statusCode: 409, message: "Username already exists" };
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await repository.createUser({
    username,
    password_hash: passwordHash,
    full_name: fullName,
    email,
    role: "language_expert",
    dialects,
  });
  if (!user) return { success: false, statusCode: 500, message: "Failed to create user" };
  return { success: true, expert: { id: user.id, username: user.username, dialects: user.dialects } };
}

export async function deleteLanguageExpert(id: string) {
  return repository.softDeleteUser(id);
}

export async function fetchLanguageHeads() {
  return repository.findUsersByRole("language_head");
}

export async function createLanguageHead(payload: any) {
  const { fullName, email, username, password, dialects } = payload;
  const existing = await repository.findUserByUsername(username);
  if (existing) {
    return { success: false, statusCode: 409, message: "Username already exists" };
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await repository.createUser({
    username,
    password_hash: passwordHash,
    full_name: fullName,
    email,
    role: "language_head",
    dialects,
  });
  if (!user) return { success: false, statusCode: 500, message: "Failed to create user" };
  return { success: true, head: { id: user.id, username: user.username, dialects: user.dialects } };
}

export async function deleteLanguageHead(id: string) {
  return repository.softDeleteUser(id);
}

export async function updateExpertDialects(id: string, dialects: string[]) {
  const updated = await repository.updateUserDialects(id, dialects);
  if (!updated) return { success: false, statusCode: 404, message: "User not found" };
  return { success: true, data: updated };
}

export async function updateHeadDialects(id: string, dialects: string[]) {
  const updated = await repository.updateUserDialects(id, dialects);
  if (!updated) return { success: false, statusCode: 404, message: "User not found" };
  return { success: true, data: updated };
}