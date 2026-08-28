import { createClerkClient } from "@clerk/backend";

import { env } from "../config/env.js";

export const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
  ...(env.CLERK_JWT_KEY ? { jwtKey: env.CLERK_JWT_KEY } : {}),
});
