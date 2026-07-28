import { z } from "zod";

// --- User standard schemas ---

export const UserRowSchema = z.object({
  id: z.string(),
  username: z.string(),
  full_name: z.string().nullable(),
  email: z.string().email(),
  role: z.string(),
  dialects: z.array(z.string()).nullable(),
  is_active: z.boolean(),
  created_at: z.string(), // z.string().datetime() if strictly ISO timestamps
  points: z.number().nullable(),
}).passthrough(); // Handles [key: string]: unknown

export type UserRow = z.infer<typeof UserRowSchema>;


// Note: Your snippet contained two duplicate 'CreateUserPayload' interfaces.
// Both variations are created below:

export const CreateUserPayloadBackendSchema = z.object({
  username: z.string(),
  password_hash: z.string(),
  full_name: z.string().optional(),
  email: z.string().email(),
  role: z.string(),
  dialects: z.array(z.string()).optional(),
});

export type CreateUserPayloadBackend = z.infer<typeof CreateUserPayloadBackendSchema>;


export const CreateUserPayloadFrontendSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email(),
  username: z.string(),
  password: z.string(),
  dialects: z.array(z.string()).optional(),
});

export type CreateUserPayloadFrontend = z.infer<typeof CreateUserPayloadFrontendSchema>;


// --- Result & Service schemas ---

export const SoftDeleteResultSchema = z.object({
  success: z.boolean(),
  statusCode: z.number().optional(),
  message: z.string().optional(),
});

export type SoftDeleteResult = z.infer<typeof SoftDeleteResultSchema>;


// Generic function generator for ServiceResult<T>
export const createServiceResultSchema = <T extends z.ZodTypeAny>(dataSchema: T = z.unknown() as any) =>
  z.object({
    success: z.boolean(),
    statusCode: z.number().optional(),
    message: z.string().optional(),
    data: dataSchema.optional(),
    expert: dataSchema.optional(),
    head: dataSchema.optional(),
  });

export const ServiceResultSchema = createServiceResultSchema();
export type ServiceResult<T = unknown> = z.infer<ReturnType<typeof createServiceResultSchema<z.ZodType<T>>>>;