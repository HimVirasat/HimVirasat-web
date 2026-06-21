import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

import type { JwtUser } from "../types/auth.types.js";

export function generateToken(payload: JwtUser): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    // fix as never someday
    expiresIn: env.JWT_EXPIRES_IN as never,
  });
}

export function verifyToken(token: string): JwtUser {
  return jwt.verify(token, env.JWT_SECRET) as JwtUser;
}