import { z } from "zod";
import { SystemRoleSchema } from "../../common/roles.js";
import {
  ContributionStatusSchema,
  CommentStatusSchema,
} from "../submissions/submission.dto.js";

// Database User Record (Internal server use only - includes password hash)
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  password_hash: z.string(),
  full_name: z.string(),
  email: z.string().nullable(),
  role: SystemRoleSchema,
  dialects: z.array(z.string()),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const ReviewCommentSchema = z.object({
  id: z.string(),
  contribution_id: z.string(),
  author_id: z.string(),
  field_name: z.string().nullable(),
  message: z.string(),
  status: CommentStatusSchema,
  created_at: z.string(),
  resolved_at: z.string().nullable().optional(),
  resolved_by: z.string().nullable().optional(),
  users: z
    .object({ username: z.string(), full_name: z.string().optional() })
    .optional(),
});
export type ReviewComment = z.infer<typeof ReviewCommentSchema>;

export const ContributionHistorySchema = z.object({
  id: z.string(),
  contribution_id: z.string(),
  action: z.string(),
  performed_by: z.string(),
  details: z.string().nullable().optional(),
  created_at: z.string(),
  users: z
    .object({ username: z.string(), full_name: z.string().optional() })
    .optional(),
});
export type ContributionHistory = z.infer<typeof ContributionHistorySchema>;

export const ContributionSchema = z.object({
  id: z.string(),
  contributor_id: z.string(),
  dialect_id: z.number(),
  category_id: z.number().nullable().optional(),
  part_of_speech_id: z.number().nullable().optional(),
  word_devanagari: z.string(),
  word_latin: z.string().nullable().optional(),
  word_takri: z.string().nullable().optional(),
  ipa: z.string().nullable().optional(),
  meaning: z.string(),
  meaning_hindi: z.string().nullable().optional(),
  meaning_english: z.string().nullable().optional(),
  example_sentence: z.string().nullable().optional(),
  example_sentence_hindi: z.string().nullable().optional(),
  example_sentence_english: z.string().nullable().optional(),
  example_sentence_latin: z.string().nullable().optional(),
  example_sentence_takri: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  status: ContributionStatusSchema,
  flag_reason: z.string().nullable().optional(),
  flagged_by: z.string().nullable().optional(),
  flagged_at: z.string().nullable().optional(),
  rejected_reason: z.string().nullable().optional(),
  rejected_by: z.string().nullable().optional(),
  approved_by: z.string().nullable().optional(),
  approved_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),

  // UI / Joined Convenience fields
  contributor_name: z.string().optional(),
  dialect_name: z.string().optional(),
  category_name: z.string().optional(),
  part_of_speech_name: z.string().optional(),

  users: z
    .object({ username: z.string(), full_name: z.string().optional() })
    .optional(),
  dialects: z.object({ name: z.string() }).optional(),
  categories: z.object({ name: z.string() }).optional(),
  parts_of_speech: z.object({ name: z.string() }).optional(),
  review_comments: z.array(ReviewCommentSchema).optional(),
  history: z.array(ContributionHistorySchema).optional(),
});
export type Contribution = z.infer<typeof ContributionSchema>;