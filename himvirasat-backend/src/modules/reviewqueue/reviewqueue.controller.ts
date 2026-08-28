import {
  ContributionsController,
  contributionsController,
} from "./contributions/contributions.controller.js";
import {
  CommentsController,
  commentsController,
} from "./comments/comments.controller.js";

/**
 * Facade controller that delegates to the split sub-module controllers.
 * Kept for backward compatibility with the module barrel exports.
 */
export class ReviewQueueController {
  createReviewQueue: ContributionsController["create"];
  getReviewQueue: ContributionsController["getList"];
  getReviewQueueById: ContributionsController["getById"];
  updateReviewQueue: ContributionsController["update"];
  updateReviewQueueStatus: ContributionsController["updateStatus"];
  deleteReviewQueue: ContributionsController["delete"];
  addReviewQueueComment: CommentsController["add"];
  updateReviewQueueCommentStatus: CommentsController["updateStatus"];

  constructor(
    contributions: ContributionsController = contributionsController,
    comments: CommentsController = commentsController,
  ) {
    this.createReviewQueue = contributions.create;
    this.getReviewQueue = contributions.getList;
    this.getReviewQueueById = contributions.getById;
    this.updateReviewQueue = contributions.update;
    this.updateReviewQueueStatus = contributions.updateStatus;
    this.deleteReviewQueue = contributions.delete;
    this.addReviewQueueComment = comments.add;
    this.updateReviewQueueCommentStatus = comments.updateStatus;
  }
}

export const reviewQueueController = new ReviewQueueController();
