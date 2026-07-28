// packages/shared/src/dtos/admin.dto.ts

import { z } from "zod";

// --- Base User Schema ---
const BaseUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  full_name: z.string(),
  email: z.string().nullable(),
  dialects: z.array(z.string()),
  is_active: z.boolean(),
  created_at: z.string(),
  points: z.number(),
});

// --- Language Experts & Language Heads ---
export const LanguageExpertDtoSchema = BaseUserSchema.extend({
  role: z.literal("language_expert"),
});
export type LanguageExpertDto = z.infer<typeof LanguageExpertDtoSchema>;
// 👈 Backwards compatibility alias
export type LanguageExpert = LanguageExpertDto;
export const LanguageExpertSchema = LanguageExpertDtoSchema;

export const LanguageHeadDtoSchema = BaseUserSchema.extend({
  role: z.literal("language_head"),
});
export type LanguageHeadDto = z.infer<typeof LanguageHeadDtoSchema>;
// 👈 Backwards compatibility alias
export type LanguageHead = LanguageHeadDto;
export const LanguageHeadSchema = LanguageHeadDtoSchema;

// --- Dashboard Statistics ---
export const DashboardStatsDtoSchema = z.object({
  languageExpertsCount: z.number().nonnegative(),
  languageHeadsCount: z.number().nonnegative(),
  superAdminsCount: z.number().nonnegative(),
});
export type DashboardStatsDto = z.infer<typeof DashboardStatsDtoSchema>;
// 👈 Backwards compatibility alias
export type DashboardStats = DashboardStatsDto;
export const DashboardStatsSchema = DashboardStatsDtoSchema;

// --- Admin Actions ---
export const DeleteLanguageExpertResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  deleted_id: z.string(),
});
export type DeleteLanguageExpertResponse = z.infer<
  typeof DeleteLanguageExpertResponseSchema
>;