import bcrypt from "bcrypt";

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
