import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const schema = z.object({
  PORT: z.string().default("3000"),

  SUPABASE_URL: z.string(),

  SUPABASE_SERVICE_ROLE_KEY: z.string(),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
});

export const env = schema.parse(process.env);
