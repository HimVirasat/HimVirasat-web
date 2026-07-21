// src/types/contribution.types.ts

export type ReviewQueueStatus =
  "draft" | "under_review" | "flagged" | "approved" | "rejected";
export type CommentStatus = "open" | "accepted" | "resolved" | "rejected";
export type HistoryEventType =
  | "submitted"
  | "comment_added"
  | "comment_resolved"
  | "flagged"
  | "flag_removed"
  | "approved"
  | "rejected"
  | "edited";

export interface ReviewQueueInput {
  id: string;
  dialect_id: number;
  category_id?: number;
  part_of_speech_id?: number;
  word_devanagari: string;
  word_latin?: string;
  word_takri?: string;
  ipa?: string;
  meaning: string;
  meaning_hindi?: string;
  meaning_english?: string;
  example_sentence?: string;
  example_sentence_hindi?: string;
  example_sentence_english?: string;
  example_sentence_latin?: string;
  example_sentence_takri?: string;
  region?: string;
}

export interface ContributionCommentInput {
  field_name?: string;
  message: string;
}
