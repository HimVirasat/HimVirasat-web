import { randomUUID } from "crypto";
import {
  RawContribution,
  ContributionFilters,
  POINT_REWARDS,
} from "@himvirasat/shared";
import {
  CONTRIBUTION_SELECT_QUERY,
  reviewQueueRepository,
  ReviewQueueRepository,
} from "./reviewqueue.repository.js";
import { logger } from "../../utils/logger.js";
import type { HistoryEventType, CommentStatus } from "@himvirasat/shared";
import { usersRepository } from "../users/users.repository.js";
import { AuditLogger } from "../../utils/audit-logger.js";
import { SecurityContext } from "../../utils/get-authenticated-user.js";

export class ReviewQueueService {
  constructor(
    private readonly repository: ReviewQueueRepository = reviewQueueRepository,
  ) {}

  private formatContribution(item: RawContribution | null) {
    if (!item) return item;
    return {
      ...item,
      contributor_name:
        item.users?.full_name || item.users?.username || "Contributor",
      dialect_name: item.dialects?.name || "Standard",
      category_name: item.categories?.name || "General Vocabulary",
      part_of_speech_name: item.parts_of_speech?.name || "General",
    };
  }

  private sanitizeContributionInput(
    input: Record<string, unknown> | undefined,
  ) {
    const {
      id,
      categories,
      dialects,
      users,
      parts_of_speech,
      category_name,
      dialect_name,
      contributor_name,
      part_of_speech_name,
      review_comments,
      history,
      created_at,
      updated_at,
      ...cleanColumns
    } = input || {};

    return cleanColumns;
  }

  async createContribution(
    ctx: SecurityContext,
    payload: Record<string, unknown>,
  ) {
    const customUUID = randomUUID();

    await this.repository.insertContribution({
      id: customUUID,
      contributor_id: ctx.actor.id,
      ...payload,
    });

    await this.repository.insertHistory({
      contribution_id: customUUID,
      actor_id: ctx.actor.id,
      type: "submitted",
      message: "Contribution submitted for review.",
    });

    await AuditLogger.logActivity({
      action: "CREATE_REVIEW_QUEUE",
      entityType: "review_item",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "review_queue",
      backendCode: "REVIEWQUEUE_SERVICE:SUCCESS_CREATE_CONTRIBUTION_SUBMISSION",
      logStatus: "SUCCESS",
      metadata: {
        target_id: customUUID,
        wordDevanagari: payload.word_devanagari || null,
        dialectId: payload.dialect_id || null,
        detailed_user: ctx.actor,
      },
    });

    const enriched = await this.repository.fetchContributionById(
      customUUID,
      CONTRIBUTION_SELECT_QUERY,
    );

    return this.formatContribution(enriched);
  }

  async fetchContributions(
    _ctx: SecurityContext,
    filters: ContributionFilters,
  ) {
    const data = await this.repository.fetchContributions(
      filters,
      CONTRIBUTION_SELECT_QUERY,
    );
    return data.map((item) => this.formatContribution(item));
  }

  async fetchContributionById(_ctx: SecurityContext, id: string) {
    const item = await this.repository.fetchContributionById(
      id,
      CONTRIBUTION_SELECT_QUERY,
    );
    if (!item) return null;

    const comments = await this.repository.fetchCommentsByContributionId(id);
    const history = await this.repository.fetchHistoryByContributionId(id);

    return {
      ...this.formatContribution(item),
      review_comments: comments || [],
      history: history || [],
    };
  }

  async updateContribution(
    ctx: SecurityContext,
    id: string,
    payload: Record<string, unknown>,
  ) {
    const currentData = await this.repository.fetchContributionRaw(id);
    if (!currentData) {
      throw new Error("Contribution record not found.");
    }

    const cleanUpdates = this.sanitizeContributionInput(payload);

    const diffEntries: {
      field_name: string;
      old_value: string;
      new_value: string;
    }[] = [];

    Object.keys(cleanUpdates).forEach((key) => {
      const oldVal =
        currentData[key] !== null && currentData[key] !== undefined
          ? String(currentData[key])
          : "";
      const newVal =
        cleanUpdates[key] !== null && cleanUpdates[key] !== undefined
          ? String(cleanUpdates[key])
          : "";

      if (oldVal !== newVal) {
        diffEntries.push({
          field_name: key,
          old_value: oldVal,
          new_value: newVal,
        });
      }
    });

    if (diffEntries.length === 0) {
      const enriched = await this.repository.fetchContributionById(
        id,
        CONTRIBUTION_SELECT_QUERY,
      );
      return this.formatContribution(enriched);
    }

    await this.repository.updateContribution(id, cleanUpdates);

    const historyRows = diffEntries.map((diff) => ({
      contribution_id: id,
      actor_id: ctx.actor.id,
      type: "field_updated" as HistoryEventType,
      field_name: diff.field_name,
      old_value: diff.old_value,
      new_value: diff.new_value,
      message: `Updated [${diff.field_name}]: '${diff.old_value || "empty"}' ➔ '${diff.new_value || "empty"}'`,
    }));

    await this.repository
      .insertHistoryBatch(historyRows)
      .catch((err) =>
        logger.warn(
          "Failed logging individual field changes to contribution_history",
          err,
        ),
      );

    await AuditLogger.logActivity({
      action: "UPDATE_REVIEW_QUEUE",
      entityType: "review_item",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "review_queue",
      backendCode: "REVIEWQUEUE_SERVICE:SUCCESS_UPDATE_CONTRIBUTION",
      logStatus: "SUCCESS",
      metadata: {
        target_id: id,
        updatedFields: diffEntries.map((d) => d.field_name),
        detailed_user: ctx.actor,
      },
    });

    const enriched = await this.repository.fetchContributionById(
      id,
      CONTRIBUTION_SELECT_QUERY,
    );

    return this.formatContribution(enriched);
  }

  async updateContributionStatus(
    ctx: SecurityContext,
    id: string,
    payload: { status: string; reason?: string | undefined },
  ) {
    const { status, reason } = payload;
    const statusUpdates: Record<string, unknown> = { status };
    let historyType: HistoryEventType = "submitted";

    const existingContribution = await this.repository.fetchContributionById(
      id,
      "id, contributor_id, dialect_id, status, word_devanagari",
    );

    if (!existingContribution) {
      throw new Error("Contribution not found");
    }

    const previousStatus = existingContribution.status;
    const contributionUuid = (existingContribution.id || id) as string;

    if (status === "flagged") {
      statusUpdates.flag_reason = reason;
      statusUpdates.flagged_by = ctx.actor.id;
      statusUpdates.flagged_at = new Date().toISOString();
      historyType = "flagged";
    } else if (status === "approved") {
      statusUpdates.approved_by = ctx.actor.id;
      statusUpdates.approved_at = new Date().toISOString();
      historyType = "approved";
    } else if (status === "rejected") {
      statusUpdates.rejected_reason = reason;
      statusUpdates.rejected_by = ctx.actor.id;
      historyType = "rejected";
    } else if (status === "under_review") {
      statusUpdates.flag_reason = null;
      historyType = "flag_removed";
    }

    await this.repository.updateContribution(id, statusUpdates);

    await this.repository.insertHistory({
      contribution_id: contributionUuid,
      actor_id: ctx.actor.id,
      type: historyType,
      message: reason || `Status updated to ${status}.`,
    });

    await AuditLogger.logActivity({
      action: "UPDATE_REVIEW_QUEUE_STATUS",
      entityType: "review_item",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "review_queue",
      backendCode: "REVIEWQUEUE_SERVICE:SUCCESS_CONTRIBUTION_STATUS_UPDATED",
      logStatus: "SUCCESS",
      metadata: {
        target_id: id,
        previousStatus: existingContribution.status,
        newStatus: payload.status,
        reason: payload.reason,
        wordDevanagari: existingContribution.word_devanagari,
        contributorId: existingContribution.contributor_id,
        detailed_user: ctx.actor,
      },
    });

    if (status === "approved" && previousStatus !== "approved") {
      const contributorId = existingContribution.contributor_id as
        string | undefined;
      const dialectId =
        typeof existingContribution.dialect_id === "number"
          ? existingContribution.dialect_id
          : undefined;

      try {
        if (contributorId) {
          await usersRepository.awardPoints({
            userId: contributorId,
            points: POINT_REWARDS.CONTRIBUTOR_APPROVED,
            reason: "contribution_approved",
            referenceId: contributionUuid,
            dialectId: dialectId,
            isContributor: true,
          });

          await AuditLogger.logActivity({
            action: "UPDATE_REVIEW_QUEUE_STATUS",
            entityType: "user",
            actorUserId: ctx.actor.id,
            backendModuleCategory: "review_queue",
            backendCode: "REVIEWQUEUE_SERVICE:SUCCESS_AWARD_CONTRIBUTOR_POINTS",
            logStatus: "SUCCESS",
            metadata: {
              target_id: contributorId,
              contributionId: contributionUuid,
              points: POINT_REWARDS.CONTRIBUTOR_APPROVED,
              reason: "contribution_approved",
              detailed_user: ctx.actor,
            },
          });
        }

        if (ctx.actor.id && ctx.actor.id !== contributorId) {
          await usersRepository.awardPoints({
            userId: ctx.actor.id,
            points: POINT_REWARDS.REVIEWER_APPROVED,
            reason: "review_completed",
            referenceId: contributionUuid,
            dialectId: dialectId,
            isContributor: false,
          });

          await AuditLogger.logActivity({
            action: "UPDATE_REVIEW_QUEUE_STATUS",
            entityType: "user",
            actorUserId: ctx.actor.id,
            backendModuleCategory: "review_queue",
            backendCode: "REVIEWQUEUE_SERVICE:SUCCESS_AWARD_REVIEWER_POINTS",
            logStatus: "SUCCESS",
            metadata: {
              target_id: ctx.actor.id,
              contributionId: contributionUuid,
              points: POINT_REWARDS.REVIEWER_APPROVED,
              reason: "review_completed",
              detailed_user: ctx.actor,
            },
          });
        }
      } catch (error: any) {
        await AuditLogger.logError({
          action: "UPDATE_REVIEW_QUEUE_STATUS",
          actorUserId: ctx.actor.id,
          errorMessage:
            error.message || "Failed to award points during status approval",
          stackTrace: error.stack,
          serviceCategory: "review_queue",
          backendCode: "REVIEWQUEUE_SERVICE:FAILED_AWARD_POINTS",
          code: "500",
          logStatus: "FAILED",
          path: `/api/contributions/${id}/status`,
          method: "PATCH",
          metadata: {
            contributionId: id,
            attemptedStatus: payload.status,
            detailed_user: ctx.actor,
          },
        });
        console.error("Failed to award points during status approval:", error);
      }
    }

    const enriched = await this.repository.fetchContributionById(
      id,
      CONTRIBUTION_SELECT_QUERY,
    );

    return this.formatContribution(enriched);
  }

  async deleteContribution(ctx: SecurityContext, id: string) {
    await this.repository.deleteContribution(id);

    await AuditLogger.logActivity({
      action: "DELETE_REVIEW_QUEUE",
      entityType: "review_item",
      actorUserId: ctx.actor.id,
      backendModuleCategory: "review_queue",
      backendCode: "REVIEWQUEUE_SERVICE:SUCCESS_CONTRIBUTION_DELETED",
      logStatus: "SUCCESS",
      metadata: { target_id: id, detailed_user: ctx.actor },
    });
  }

  async addContributionComment(
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

  async updateCommentStatus(
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

    const commentFieldName = (updatedComment.field_name as string) || "General";
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
      { username?: string; full_name?: string } | undefined;
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

export const reviewQueueService = new ReviewQueueService();
