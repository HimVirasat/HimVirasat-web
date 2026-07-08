export type SystemRole = "language_expert" | "language_head" | "super_admin";

export type ContributionStatus =
  // | "draft"
  "under_review" | "approved" | "flagged" | "rejected";

export type ReviewCommentStatus = "open" | "resolved" | "rejected";
// types/admin/FSM/contribution-rules.ts

export type SubmissionFormValues = {
  // Core Fields
  dialect: string;
  word_devanagari: string;
  meaning_hindi: string;
  example_sentence: string; // Sentence using that word in Pahadi (written in Devanagari)
  example_sentence_hindi_meaning: string; // Sentence meaning in Hindi
  region: string;
  category: string;
  part_of_speech: string;

  // Advanced Fields
  word_latin: string;
  example_sentence_latin: string;
  word_takri: string;
  example_sentence_takri: string;
};
export type HistoryEventType =
  | "submitted"
  | "edited"
  | "comment_added"
  | "comment_resolved"
  | "comment_rejected"
  | "comment_accepted"
  | "flagged"
  | "flag_removed"
  | "approved"
  | "rejected";

export interface ReviewComment {
  id: string;
  author_id: string;
  author_name: string;
  field_name: string | null;
  message: string;
  status: ReviewCommentStatus;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface ContributionHistoryEvent {
  id: string;
  type: HistoryEventType;
  actor_id: string;
  actor_name: string;
  message: string;
  created_at: string;
}

export interface Contribution {
  id: string;
  contributor_id: string;
  contributor_name: string;
  dialect: string;
  word_devanagari: string;
  meaning: string;
  example_sentence: string;
  region: string | null;
  category: string | null;
  word_latin: string | null;
  ipa: string | null;
  meaning_hindi: string | null;
  meaning_english: string | null;
  example_sentence_english: string | null;
  example_sentence_hindi: string | null;
  status: ContributionStatus;
  review_comments: ReviewComment[];
  history: ContributionHistoryEvent[];
  flag_reason: string | null;
  flagged_by: string | null;
  rejected_reason: string | null;
  rejected_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StateRule {
  label: string;
  description: string;
  canEdit: (
    userId: string,
    entry: Contribution,
    userRole: SystemRole
  ) => boolean;
  canComment: (
    userId: string,
    entry: Contribution,
    userRole: SystemRole
  ) => boolean;
  canApprove: (
    userId: string,
    entry: Contribution,
    userRole: SystemRole
  ) => boolean;
  canFlag: (
    userId: string,
    entry: Contribution,
    userRole: SystemRole
  ) => boolean;
  canRemoveFlag: (userRole: SystemRole) => boolean;
  canReject: (userRole: SystemRole) => boolean;
}

export const isAuthorityRole = (role: SystemRole) =>
  role === "language_head" || role === "super_admin";

export const hasOpenReviewComments = (entry: Contribution) =>
  entry.review_comments.some((comment) => comment.status === "open");

export const getOpenReviewCommentCount = (entry: Contribution) =>
  entry.review_comments.filter((comment) => comment.status === "open").length;

const canReview = (userId: string, entry: Contribution, role: SystemRole) =>
  entry.status === "under_review" &&
  userId !== entry.contributor_id &&
  ["language_expert", "language_head", "super_admin"].includes(role);
export const WORKFLOW_RULES: Record<ContributionStatus, StateRule> = {
  under_review: {
    label: "Under Review",
    description: "Open for peer review and moderation.",
    // LHs and SAs can edit any entry; regular contributors/LEs can only edit their own submissions
    canEdit: (userId, entry, userRole) =>
      isAuthorityRole(userRole) || userId === entry.contributor_id,
    canComment: canReview,
    canApprove: (userId, entry, role) =>
      canReview(userId, entry, role) &&
      (isAuthorityRole(role) || !hasOpenReviewComments(entry)),
    canFlag: canReview,
    canRemoveFlag: () => false,
    canReject: (role) => isAuthorityRole(role),
  },
  approved: {
    label: "Approved",
    description: "Ready for production publishing.",
    canEdit: () => false,
    canComment: () => false,
    canApprove: () => false,
    canFlag: () => false,
    canRemoveFlag: () => false,
    canReject: (role) => isAuthorityRole(role),
  },
  flagged: {
    label: "Flagged",
    description: "Needs Language Head or Super Admin intervention.",
    // LHs and SAs can edit any entry; regular contributors/LEs can only edit their own submissions
    canEdit: (userId, entry, userRole) =>
      isAuthorityRole(userRole) || userId === entry.contributor_id,
    canComment: (_userId, _entry, role) => isAuthorityRole(role),
    canApprove: (_userId, _entry, role) => isAuthorityRole(role),
    canFlag: () => false,
    canRemoveFlag: (role) => isAuthorityRole(role),
    canReject: (role) => isAuthorityRole(role),
  },
  rejected: {
    label: "Rejected",
    description: "Closed after authority rejection.",
    canEdit: () => false,
    canComment: () => false,
    canApprove: () => false,
    canFlag: () => false,
    canRemoveFlag: () => false,
    canReject: () => false,
  },
};
