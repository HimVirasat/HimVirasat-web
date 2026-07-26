import { SystemRole } from "../common/roles.js";
import { ContributionStatus } from "../dtos/submission.dto.js";
import { Contribution } from "../db/entities.js";

export interface StateRule {
  label: string;
  description: string;
  canEdit: (userId: string, entry: Contribution, userRole: SystemRole) => boolean;
  canComment: (userId: string, entry: Contribution, userRole: SystemRole) => boolean;
  canApprove: (userId: string, entry: Contribution, userRole: SystemRole) => boolean;
  canFlag: (userId: string, entry: Contribution, userRole: SystemRole) => boolean;
  canRemoveFlag: (userRole: SystemRole) => boolean;
  canReject: (userRole: SystemRole) => boolean;
}

export const isAuthorityRole = (role: SystemRole) =>
  role === "language_head" || role === "super_admin";

export const hasOpenReviewComments = (entry: Contribution) =>
  (entry.review_comments ?? []).some((comment) => comment.status === "open");

export const getOpenReviewCommentCount = (entry: Contribution) =>
  (entry.review_comments ?? []).filter((comment) => comment.status === "open").length;

const canReview = (userId: string, entry: Contribution, role: SystemRole) =>
  entry.status === "under_review" &&
  userId !== entry.contributor_id &&
  ["language_expert", "language_head", "super_admin"].includes(role);

export const WORKFLOW_RULES: Record<ContributionStatus, StateRule> = {
  under_review: {
    label: "Under Review",
    description: "Open for peer review and moderation.",
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