// // src/types/admin/contribution-types.ts

// // --- Enums & Status Unions ---

// export type SystemRole = "language_expert" | "language_head" | "super_admin";

// export type ContributionStatus =
//   | 'under_review'
//   | 'flagged'
//   | 'approved'
//   | 'rejected';

// export type CommentStatus = 'open' | 'accepted' | 'resolved' | 'rejected';

// export type HistoryEventType =
//   | 'submitted'
//   | 'edited'
//   | 'comment_added'
//   | 'comment_resolved'
//   | 'comment_rejected'
//   | 'comment_accepted'
//   | 'flagged'
//   | 'flag_removed'
//   | 'approved'
//   | 'rejected';

// // --- Form Values (UI Helper) ---

// export interface SubmissionFormValues {
//   id?: string;
//   contributor_id?: string;
//   dialect_id: number;
//   category_id?: number;
//   part_of_speech_id?: number; // 👈 ADDED
//   word_devanagari: string;
//   word_latin?: string;
//   word_takri?: string; // 👈 ADDED
//   ipa?: string;
//   meaning: string;
//   meaning_hindi?: string;
//   meaning_english?: string;
//   example_sentence?: string;
//   example_sentence_hindi?: string;
//   example_sentence_english?: string;
//   example_sentence_latin?: string; // 👈 ADDED
//   example_sentence_takri?: string; // 👈 ADDED
//   region?: string;
//   status?: "draft" | "under_review" | "approved" | "rejected" | "flagged";
// }
// // --- Database-Aligned Interfaces ---

// export interface Contribution {
//   // DB Columns
//   id: string;
//   contributor_id: string;
//   dialect_id: number;
//   category_id?: number | null;
//   part_of_speech_id?: number | null;      // 👈 Added
//   word_devanagari: string;
//   word_latin?: string | null;
//   word_takri?: string | null;             // 👈 Added
//   ipa?: string | null;
//   meaning: string;
//   meaning_hindi?: string | null;
//   meaning_english?: string | null;
//   example_sentence?: string | null;
//   example_sentence_hindi?: string | null;
//   example_sentence_english?: string | null;
//   example_sentence_latin?: string | null; // 👈 Added
//   example_sentence_takri?: string | null; // 👈 Added
//   region?: string | null;
//   status: ContributionStatus;
//   flag_reason?: string | null;
//   flagged_by?: string | null;
//   flagged_at?: string | null;
//   rejected_reason?: string | null;
//   rejected_by?: string | null;
//   approved_by?: string | null;
//   approved_at?: string | null;
//   created_at: string;
//   updated_at: string;

//   // UI/Convenience Fields (Populated via joins or helper functions)
//   contributor_name?: string;
//   dialect_name?: string;
//   category_name?: string;
//   part_of_speech_name?: string;           // 👈 Added

//   // Relations
//   users?: { username: string; full_name?: string };
//   dialects?: { name: string };
//   categories?: { name: string };          // 👈 Added for consistency
//   parts_of_speech?: { name: string };     // 👈 Added
//   review_comments?: ReviewComment[];
//   history?: ContributionHistoryEvent[];
// }
// export interface ReviewComment {
//   id: string;
//   contribution_id: string;
//   author_id: string;
//   field_name: string | null;
//   message: string;
//   status: CommentStatus;
//   created_at: string;
//   resolved_at?: string | null;
//   resolved_by?: string | null;

//   // Relations
//   users?: { username: string };
// }

// export interface ContributionHistoryEvent {
//   id: string;
//   contribution_id: string;
//   actor_id: string;
//   type: HistoryEventType;
//   message: string;
//   created_at: string;

//   // Relations
//   users?: { username: string };
// }

// // --- API Helpers ---

// export interface ContributionFilters {
//   status?: ContributionStatus;
//   dialect_id?: number;
// }

// export interface StateRule {
//   label: string;
//   description: string;
//   canEdit: (
//     userId: string,
//     entry: Contribution,
//     userRole: SystemRole
//   ) => boolean;
//   canComment: (
//     userId: string,
//     entry: Contribution,
//     userRole: SystemRole
//   ) => boolean;
//   canApprove: (
//     userId: string,
//     entry: Contribution,
//     userRole: SystemRole
//   ) => boolean;
//   canFlag: (
//     userId: string,
//     entry: Contribution,
//     userRole: SystemRole
//   ) => boolean;
//   canRemoveFlag: (userRole: SystemRole) => boolean;
//   canReject: (userRole: SystemRole) => boolean;
// }

// export const isAuthorityRole = (role: SystemRole) =>
//   role === "language_head" || role === "super_admin";

// export const hasOpenReviewComments = (entry: Contribution) =>
//   (entry.review_comments ?? []).some((comment) => comment.status === "open");

// export const getOpenReviewCommentCount = (entry: Contribution) =>
//   (entry.review_comments ?? []).filter((comment) => comment.status === "open").length;

// const canReview = (userId: string, entry: Contribution, role: SystemRole) =>
//   entry.status === "under_review" &&
//   userId !== entry.contributor_id &&
//   ["language_expert", "language_head", "super_admin"].includes(role);
// export const WORKFLOW_RULES: Record<ContributionStatus, StateRule> = {
//   under_review: {
//     label: "Under Review",
//     description: "Open for peer review and moderation.",
//     // LHs and SAs can edit any entry; regular contributors/LEs can only edit their own submissions
//     canEdit: (userId, entry, userRole) =>
//       isAuthorityRole(userRole) || userId === entry.contributor_id,
//     canComment: canReview,
//     canApprove: (userId, entry, role) =>
//       canReview(userId, entry, role) &&
//       (isAuthorityRole(role) || !hasOpenReviewComments(entry)),
//     canFlag: canReview,
//     canRemoveFlag: () => false,
//     canReject: (role) => isAuthorityRole(role),
//   },
//   approved: {
//     label: "Approved",
//     description: "Ready for production publishing.",
//     canEdit: () => false,
//     canComment: () => false,
//     canApprove: () => false,
//     canFlag: () => false,
//     canRemoveFlag: () => false,
//     canReject: (role) => isAuthorityRole(role),
//   },
//   flagged: {
//     label: "Flagged",
//     description: "Needs Language Head or Super Admin intervention.",
//     // LHs and SAs can edit any entry; regular contributors/LEs can only edit their own submissions
//     canEdit: (userId, entry, userRole) =>
//       isAuthorityRole(userRole) || userId === entry.contributor_id,
//     canComment: (_userId, _entry, role) => isAuthorityRole(role),
//     canApprove: (_userId, _entry, role) => isAuthorityRole(role),
//     canFlag: () => false,
//     canRemoveFlag: (role) => isAuthorityRole(role),
//     canReject: (role) => isAuthorityRole(role),
//   },
//   rejected: {
//     label: "Rejected",
//     description: "Closed after authority rejection.",
//     canEdit: () => false,
//     canComment: () => false,
//     canApprove: () => false,
//     canFlag: () => false,
//     canRemoveFlag: () => false,
//     canReject: () => false,
//   },
// };
