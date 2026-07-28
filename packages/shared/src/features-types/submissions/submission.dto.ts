import { z } from "zod";

export const ContributionStatusSchema = z.enum([
  "under_review",
  "flagged",
  "approved",
  "rejected",
]);
export type ContributionStatus = z.infer<typeof ContributionStatusSchema>;

export const CommentStatusSchema = z.enum([
  "open",
  "accepted",
  "resolved",
  "rejected",
]);
export type CommentStatus = z.infer<typeof CommentStatusSchema>;

const optionalText = z.string().trim().nullable().optional();

export const CreateSubmissionSchema = z.object({
  dialect_id: z.number().int().positive("dialect_id is required."),
  category_id: z.number().int().positive().nullable().optional(),
  part_of_speech_id: z.number().int().positive().nullable().optional(),
  word_devanagari: z.string().trim().min(1, "Devanagari word cannot be empty."),
  word_latin: optionalText,
  word_takri: optionalText,
  ipa: optionalText,
  meaning: z.string().trim().min(1, "Meaning is required."),
  meaning_hindi: optionalText,
  meaning_english: optionalText,
  example_sentence: optionalText,
  example_sentence_hindi: optionalText,
  example_sentence_english: optionalText,
  example_sentence_latin: optionalText,
  example_sentence_takri: optionalText,
  region: optionalText,
});
export type CreateSubmissionDto = z.infer<typeof CreateSubmissionSchema>;


export const UpdateStatusPayloadSchema = z.object({
  status: ContributionStatusSchema,
  reason: z.string().optional(),
});
export type UpdateStatusPayload = z.infer<typeof UpdateStatusPayloadSchema>;

export const AddCommentPayloadSchema = z.object({
  field_name: z.string().optional(),
  message: z.string().min(1, "Comment message cannot be empty"),
});
export type AddCommentPayload = z.infer<typeof AddCommentPayloadSchema>;

export const UpdateCommentStatusPayloadSchema = z.object({
  status: CommentStatusSchema,
  fieldValueToAccept: z.any().optional(),
});
export type UpdateCommentStatusPayload = z.infer<
  typeof UpdateCommentStatusPayloadSchema
>;
export const HistoryEventTypeSchema = z.enum([
  "submitted",
  "edited",
  "field_updated",
  "comment_added",
  "comment_resolved",
  "comment_rejected",
  "comment_accepted",
  "flagged",
  "flag_removed",
  "approved",
  "rejected",
]);
export type HistoryEventType = z.infer<typeof HistoryEventTypeSchema>;


