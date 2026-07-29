import { z } from "zod";

// --- Request Schema ---
export const GenerateMetadataInputSchema = z.object({
  word_devanagari: z.string().min(1, "Devanagari word is required"),
  meaning_hindi: z.string().optional(),
  meaning_english: z.string().optional(),
  example_sentence: z.string().optional(),
});
export type GenerateMetadataInput = z.infer<typeof GenerateMetadataInputSchema>;

// --- Internal Data Shape ---
export interface LinguisticMetadata {
  word_latin: string;
  word_takri: string;
  ipa: string;
  example_sentence_latin: string;
  example_sentence_takri: string;
}

// --- Response Contract ---
export interface MetadataGenerationResult {
  model: string;
  data: LinguisticMetadata;
}
// Zod Schema & Type for Service Categories
export const ServiceCategorySchema = z.enum([
  "auth",
  "dashboard",
  "datalookup",
  "review_queue",
  "submissions",
  "users",
]);

export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;

// Status Schema & Type
export const LogStatusSchema = z.enum(["SUCCESS", "FAILED"]);
export type LogStatus = z.infer<typeof LogStatusSchema>;

// Activity Log Schema & Type
export const ActivityLogSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  actor_id: z.string().nullable().optional(),
  actor_name: z.string().nullable().optional(),
  entity_type: z.string(),
  entity_id: z.string().nullable().optional(),
  service_category: ServiceCategorySchema,
  status: LogStatusSchema.default("SUCCESS"),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  created_at: z.string(),
});

export type ActivityLog = z.infer<typeof ActivityLogSchema>;

// Error Log Schema & Type
export const ErrorLogSchema = z.object({
  id: z.string().uuid(),
  code: z.string().default("UNKNOWN_ERROR"),
  method: z.string().nullable().optional(),
  path: z.string().nullable().optional(),
  error_message: z.string(),
  user_id: z.string().nullable().optional(),
  user_name: z.string().nullable().optional(),
  service_category: ServiceCategorySchema,
  status: LogStatusSchema.default("FAILED"),
  stack_trace: z.string().nullable().optional(),
  request_id: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
  created_at: z.string(),
});

export const GetLogsParamsSchema = z.object({
  service: z.string().optional(),
  status: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type GetLogsParams = z.infer<typeof GetLogsParamsSchema>;


export type ErrorLog = z.infer<typeof ErrorLogSchema>;