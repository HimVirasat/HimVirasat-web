import {
  POINT_REWARDS,
  type CommentStatus,
  type HistoryEventType,
} from "@himvirasat/shared";
import {
  ReviewQueueRepository,
  reviewQueueRepository,
} from "../reviewqueue.repository.js";
import { usersRepository } from "../../users/users.repository.js";
import { AuditLogger } from "../../../utils/audit-logger.js";
import { SecurityContext } from "../../../utils/get-authenticated-user.js";

export class CommentsService {
  constructor(
    private readonly repository: ReviewQueueRepository = reviewQueueRepository,
  ) {}

  async add(
    ctx: SecurityContext,
    contributionId: string,
    payload: { field_name: string; message: string },
  ) {
    const { field_name, message } = payload;
    const cleanFieldName =
      field_name && field_name.trim() !== "" ? field_name.trim() : "General";

    const comment = await this.repository.insertComment({
      contribution_id: contributionId,
      author_id: ctx.actor.id,
      field_name: cleanFieldName,
      message,
      status: "open",
    });

    await this.repository.insertHistory({
      contribution_id: contributionId,
      actor_id: ctx.actor.id,
      type: "comment_added",
      message: `Added review comment under [${cleanFieldName}]: "${message}"`,
    });

    await AuditLogger.logActivity({
      action: "ADD_REVIEW_QUEUE_COMMENT",
      entityType: "review_item",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "review_queue",
      backendCode: "REVIEWQUEUE_SERVICE:SUCCESS_COMMENT_ADDED",
      logStatus: "SUCCESS",
      metadata: {
        target_id: String(comment.id || contributionId),
        contributionId,
        fieldName: cleanFieldName,
        message,
        detailed_user: ctx.actor,
      },
    });

    return comment;
  }

  async updateStatus(
    ctx: SecurityContext,
    commentId: string,
    payload: { status: CommentStatus; fieldValueToAccept?: unknown },
  ) {
    const { status, fieldValueToAccept } = payload;
    const patchData: Record<string, unknown> = { status };

    if (status === "resolved") {
      patchData.resolved_at = new Date().toISOString();
      patchData.resolved_by = ctx.actor.id;
    }

    const updatedComment = await this.repository.updateComment(
      commentId,
      patchData,
    );
    if (!updatedComment) throw new Error("Comment not found");

    const commentFieldName =
      (updatedComment.field_name as string) || "General";
    const contributionId = updatedComment.contribution_id as string;

    if (
      status === "accepted" &&
      fieldValueToAccept !== undefined &&
      commentFieldName !== "General"
    ) {
      const currentData =
        await this.repository.fetchContributionRaw(contributionId);

      if (currentData) {
        const oldVal = String(currentData[commentFieldName] ?? "");
        await this.repository.updateContribution(contributionId, {
          [commentFieldName]: fieldValueToAccept,
        });

        await this.repository.insertHistory({
          contribution_id: contributionId,
          actor_id: ctx.actor.id,
          type: "field_updated",
          field_name: commentFieldName,
          old_value: oldVal,
          new_value: String(fieldValueToAccept),
          message: `Accepted comment suggestion for [${commentFieldName}]: '${oldVal}' ➔ '${fieldValueToAccept}'`,
        });
      }
    }

    if (status === "accepted") {
      const commentAuthorId = (updatedComment.user_id ||
        updatedComment.author_id) as string | undefined;

      if (commentAuthorId) {
        try {
          await usersRepository.awardPoints({
            userId: commentAuthorId,
            points: POINT_REWARDS.COMMENT_ACCEPTED,
            reason: "comment_accepted",
            referenceId: commentId,
            isContributor: true,
          });
        } catch (error: any) {
          await AuditLogger.logError({
            action: "UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
            actorUserId: ctx.actor.id,
            errorMessage:
              error.message || "Failed to award points for accepted comment",
            stackTrace: error.stack,
            serviceCategory: "review_queue",
            backendCode: "REVIEWQUEUE_SERVICE:FAILED_AWARD_COMMENT_POINTS",
            code: "500",
            logStatus: "FAILED",
            method: "PATCH",
            metadata: { commentId, commentAuthorId, detailed_user: ctx.actor },
          });
        }
      }
    }

    const historyTypeMap: Record<CommentStatus, HistoryEventType> = {
      accepted: "comment_accepted",
      rejected: "comment_rejected",
      resolved: "comment_resolved",
      open: "comment_added",
    };

    const users = updatedComment.users as
      | { username?: string; full_name?: string }
      | undefined;
    const authorName = users?.username || users?.full_name || "contributor";

    const historyMessage =
      status === "accepted"
        ? `comment accepted of ${authorName}`
        : status === "rejected"
          ? `comment rejected of ${authorName}`
          : `Marked review comment on [${commentFieldName}] as ${status}.`;

    await this.repository.insertHistory({
      contribution_id: contributionId,
      actor_id: ctx.actor.id,
      type: historyTypeMap[status],
      message: historyMessage,
    });

    await AuditLogger.logActivity({
      action: "UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
      entityType: "review_item",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "review_queue",
      backendCode: "REVIEWQUEUE_SERVICE:SUCCESS_COMMENT_STATUS_UPDATED",
      logStatus: "SUCCESS",
      metadata: {
        target_id: commentId,
        contributionId,
        commentStatus: status,
        fieldValueToAccept: fieldValueToAccept ?? null,
        detailed_user: ctx.actor,
      },
    });

    return this.repository.fetchCommentById(commentId);
  }
}

export const commentsService = new CommentsService();
