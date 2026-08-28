import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const schema = z.object({
  PORT: z.string(),

  SUPABASE_URL: z.string(),

  SUPABASE_SERVICE_ROLE_KEY: z.string(),

  CLERK_SECRET_KEY: z.string(),
  CLERK_JWT_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  CLERK_AUTHORIZED_PARTIES: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
});

export const env = schema.parse(process.env);
