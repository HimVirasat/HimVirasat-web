export type SystemRole = "language_expert" | "language_head" | "super_admin";

export type ContributionStatus =
  | "draft"
  | "pending_review_1" // New Submissions
  | "pending_review_2" // Approved 1 Stage
  | "fully_approved" // Approved 2 Stage / Production Core
  | "questionable"; // Flagged Stage

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
  //   word_tankri: string | null;
  word_latin: string | null;
  ipa: string | null;
  meaning_hindi: string | null;
  meaning_english: string | null;
  example_sentence_english: string | null;
  example_sentence_hindi: string | null;
  status: ContributionStatus;
  level1_reviewer_id: string | null;
  level2_reviewer_id: string | null;
  questionable_by: string | null;
  questionable_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface StateRule {
  label: string;
  canEdit: (
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
  canReject: (userRole: SystemRole) => boolean;
}

export const WORKFLOW_RULES: Record<ContributionStatus, StateRule> = {
  draft: {
    label: "Draft",
    canEdit: (userId, entry, role) =>
      userId === entry.contributor_id ||
      role === "language_head" ||
      role === "super_admin",
    canApprove: () => false,
    canFlag: () => false,
    canReject: (role) => role === "super_admin" || role === "language_head",
  },

  pending_review_1: {
    label: "New Submissions",
    canEdit: (_userId, _entry, role) =>
      role === "super_admin" || role === "language_head",
    canApprove: (userId, entry, role) => {
      if (role === "super_admin" || role === "language_head") return true;
      return userId !== entry.contributor_id; // LEs can only peer-approve
    },
    canFlag: () => true, // Everyone can flag
    canReject: (role) => role === "super_admin" || role === "language_head",
  },

  pending_review_2: {
    label: "Approved 1",
    canEdit: (_userId, _entry, role) =>
      role === "super_admin" || role === "language_head",
    canApprove: (userId, entry, role) => {
      if (role === "super_admin" || role === "language_head") return true;
      // LEs can approve to stage 3 if they aren't the creator and didn't perform the first review
      return (
        userId !== entry.contributor_id && entry.level1_reviewer_id !== userId
      );
    },
    canFlag: () => true,
    canReject: (role) => role === "super_admin" || role === "language_head",
  },

  fully_approved: {
    label: "Approved 2 (Finalized)",
    canEdit: (_userId, _entry, role) =>
      role === "super_admin" || role === "language_head",
    canApprove: () => false,
    canFlag: (_userId, _entry, role) =>
      role === "super_admin" || role === "language_head", // LEs locked out
    canReject: (role) => role === "super_admin" || role === "language_head",
  },

  questionable: {
    label: "Questionable / Flagged",
    canEdit: (userId, entry, role) =>
      userId === entry.contributor_id ||
      role === "language_head" ||
      role === "super_admin",
    canApprove: (_userId, _entry, role) =>
      role === "super_admin" || role === "language_head", // Only authorities can rescue
    canFlag: () => false,
    canReject: (role) => role === "super_admin" || role === "language_head",
  },
};
