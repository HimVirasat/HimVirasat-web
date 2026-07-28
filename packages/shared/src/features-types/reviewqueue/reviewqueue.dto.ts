import { z } from "zod";
import { 
  ContributionStatusSchema, 
  CommentStatusSchema, 
  HistoryEventTypeSchema 
} from "../submissions/index.js"; // adjust relative import if needed

// --- RawContribution ---
export const RawContributionSchema = z
  .object({
    id: z.string(),
    contributor_id: z.string().optional(),
    status: z.string().optional(),
    users: z
      .object({
        username: z.string().optional(),
        full_name: z.string().optional(),
      })
      .nullable()
      .optional(),
    dialects: z
      .object({ name: z.string().optional() })
      .nullable()
      .optional(),
    categories: z
      .object({ name: z.string().optional() })
      .nullable()
      .optional(),
    parts_of_speech: z
      .object({ name: z.string().optional() })
      .nullable()
      .optional(),
  })
  .passthrough(); // allows index signature [key: string]: unknown

export type RawContribution = z.infer<typeof RawContributionSchema>;

// --- ContributionFilters ---
// Note: Leveraging ContributionStatusSchema directly instead of generic z.string()
export const ContributionFiltersSchema = z.object({
  status: ContributionStatusSchema.optional(),
  dialect_id: z.number().optional(),
});

export type ContributionFilters = z.infer<typeof ContributionFiltersSchema>;

// --- InsertHistoryPayload ---
export const InsertHistoryPayloadSchema = z.object({
  contribution_id: z.string(),
  actor_id: z.string(),
  type: HistoryEventTypeSchema,
  field_name: z.string().optional(),
  old_value: z.string().optional(),
  new_value: z.string().optional(),
  message: z.string(),
});

export type InsertHistoryPayload = z.infer<typeof InsertHistoryPayloadSchema>;

// --- InsertCommentPayload ---
// Note: Leveraging CommentStatusSchema directly for stricter type safety
export const InsertCommentPayloadSchema = z.object({
  contribution_id: z.string(),
  author_id: z.string(),
  field_name: z.string(),
  message: z.string(),
  status: CommentStatusSchema,
});

export type InsertCommentPayload = z.infer<typeof InsertCommentPayloadSchema>;

export const InsertContributionPayloadSchema = z
  .object({
    id: z.string(),
    contributor_id: z.string(),
    status: ContributionStatusSchema,
    word_devanagari: z.string().optional(),
    meaning_hindi: z.string().optional(),
    meaning_english: z.string().optional(),
    dialect_id: z.number().nullable().optional(),
    category_id: z.number().nullable().optional(),
    part_of_speech_id: z.number().nullable().optional(),
  })
  .passthrough(); // preserves [key: string]: unknown flexibility

export type InsertContributionPayload = z.infer<
  typeof InsertContributionPayloadSchema
>;

// --- InsertSubmissionHistoryPayload ---
export const InsertSubmissionHistoryPayloadSchema = z.object({
  contribution_id: z.string(),
  actor_id: z.string(),
  type: HistoryEventTypeSchema,
  message: z.string(),
});

export type InsertSubmissionHistoryPayload = z.infer<
  typeof InsertSubmissionHistoryPayloadSchema
>;

// --- ContributionRecord ---
export const ContributionRecordSchema = z
  .object({
    id: z.string(),
    contributor_id: z.string(),
    status: ContributionStatusSchema,
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough(); // preserves [key: string]: unknown flexibility

export type ContributionRecord = z.infer<typeof ContributionRecordSchema>;