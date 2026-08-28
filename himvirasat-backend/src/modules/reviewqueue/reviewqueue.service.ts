import {
  ContributionsService,
  contributionsService,
} from "./contributions/contributions.service.js";
import {
  CommentsService,
  commentsService,
} from "./comments/comments.service.js";

/**
 * Facade service that delegates to the split sub-module services.
 * Kept for backward compatibility with the module barrel exports.
 */
export class ReviewQueueService {
  createContribution: ContributionsService["create"];
  fetchContributions: ContributionsService["fetch"];
  fetchContributionById: ContributionsService["fetchByIdFromContributions"];
  updateContribution: ContributionsService["update"];
  updateContributionStatus: ContributionsService["updateStatus"];
  deleteContribution: ContributionsService["delete"];
  addContributionComment: CommentsService["add"];
  updateCommentStatus: CommentsService["updateStatus"];

  constructor(
    contributions: ContributionsService = contributionsService,
    comments: CommentsService = commentsService,
  ) {
    this.createContribution = contributions.create.bind(contributions);
    this.fetchContributions = contributions.fetch.bind(contributions);
    this.fetchContributionById =
      contributions.fetchByIdFromContributions.bind(contributions);
    this.updateContribution = contributions.update.bind(contributions);
    this.updateContributionStatus = contributions.updateStatus.bind(contributions);
    this.deleteContribution = contributions.delete.bind(contributions);
    this.addContributionComment = comments.add.bind(comments);
    this.updateCommentStatus = comments.updateStatus.bind(comments);
  }
}

export const reviewQueueService = new ReviewQueueService();
