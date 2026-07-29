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
    contributorId: string,
    payload: Record<string, unknown>,
  ) {
    const customUUID = randomUUID();

    await this.repository.insertContribution({
      id: customUUID,
      contributor_id: contributorId,
      ...payload,
    });

    await this.repository.insertHistory({
      contribution_id: customUUID,
      actor_id: contributorId,
      type: "submitted",
      message: "Contribution submitted for review.",
    });

    await AuditLogger.logActivity({
      actorId: contributorId,
      action: "CONTRIBUTION_SUBMITTED",
      entityType: "contribution",
      entityId: customUUID,
      serviceCategory: "review_queue",
      status: "SUCCESS",
      metadata: {
        wordDevanagari: payload.word_devanagari || null,
        dialectId: payload.dialect_id || null,
      },
    });

    const enriched = await this.repository.fetchContributionById(
      customUUID,
      CONTRIBUTION_SELECT_QUERY,
    );

    return this.formatContribution(enriched);
  }

  async fetchContributions(filters: ContributionFilters) {
    const data = await this.repository.fetchContributions(
      filters,
      CONTRIBUTION_SELECT_QUERY,
    );
    return data.map((item) => this.formatContribution(item));
  }

  async fetchContributionById(id: string) {
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
    id: string,
    actorId: string,
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
      actor_id: actorId,
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
      actorId,
      action: "CONTRIBUTION_UPDATED",
      entityType: "contribution",
      entityId: id,
      serviceCategory: "review_queue",
      status: "SUCCESS",
      metadata: {
        updatedFields: diffEntries.map((d) => d.field_name),
      },
    });

    const enriched = await this.repository.fetchContributionById(
      id,
      CONTRIBUTION_SELECT_QUERY,
    );

    return this.formatContribution(enriched);
  }

  async updateContributionStatus(
    id: string,
    actorId: string,
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
      statusUpdates.flagged_by = actorId;
      statusUpdates.flagged_at = new Date().toISOString();
      historyType = "flagged";
    } else if (status === "approved") {
      statusUpdates.approved_by = actorId;
      statusUpdates.approved_at = new Date().toISOString();
      historyType = "approved";
    } else if (status === "rejected") {
      statusUpdates.rejected_reason = reason;
      statusUpdates.rejected_by = actorId;
      historyType = "rejected";
    } else if (status === "under_review") {
      statusUpdates.flag_reason = null;
      historyType = "flag_removed";
    }

    await this.repository.updateContribution(id, statusUpdates);

    await this.repository.insertHistory({
      contribution_id: contributionUuid,
      actor_id: actorId,
      type: historyType,
      message: reason || `Status updated to ${status}.`,
    });

    await AuditLogger.logActivity({
      actorId,
      action: `CONTRIBUTION_${payload.status.toUpperCase()}`,
      entityType: "contribution",
      entityId: id,
      serviceCategory: "review_queue",
      status: "SUCCESS",
      metadata: {
        previousStatus: existingContribution.status,
        newStatus: payload.status,
        reason: payload.reason || null,
        wordDevanagari: existingContribution.word_devanagari,
        contributorId: existingContribution.contributor_id,
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
        }

        if (actorId && actorId !== contributorId) {
          await usersRepository.awardPoints({
            userId: actorId,
            points: POINT_REWARDS.REVIEWER_APPROVED,
            reason: "review_completed",
            referenceId: contributionUuid,
            dialectId: dialectId,
            isContributor: false,
          });
        }
      } catch (error: any) {
        await AuditLogger.logError({
          userId: actorId,
          errorMessage: error.message || "Failed to award points during status approval",
          serviceCategory: "review_queue",
          stackTrace: error.stack,
          code: "AWARD_POINTS_FAILED",
          path: `/api/contributions/${id}/status`,
          method: "PATCH",
          metadata: { contributionId: id, attemptedStatus: payload.status },
        });
        console.error(
          "Failed to award points during status approval:",
          error,
        );
      }
    }

    const enriched = await this.repository.fetchContributionById(
      id,
      CONTRIBUTION_SELECT_QUERY,
    );

    return this.formatContribution(enriched);
  }

  async deleteContribution(id: string, actorId?: string) {
    await this.repository.deleteContribution(id);

    await AuditLogger.logActivity({
      actorId: actorId || null,
      action: "CONTRIBUTION_DELETED",
      entityType: "contribution",
      entityId: id,
      serviceCategory: "review_queue",
      status: "SUCCESS",
      metadata: { contributionId: id },
    });
  }

  async addContributionComment(
    contributionId: string,
    authorId: string,
    payload: { field_name: string; message: string },
  ) {
    const { field_name, message } = payload;
    const cleanFieldName =
      field_name && field_name.trim() !== "" ? field_name.trim() : "General";

    const comment = await this.repository.insertComment({
      contribution_id: contributionId,
      author_id: authorId,
      field_name: cleanFieldName,
      message,
      status: "open",
    });

    await this.repository.insertHistory({
      contribution_id: contributionId,
      actor_id: authorId,
      type: "comment_added",
      message: `Added review comment under [${cleanFieldName}]: "${message}"`,
    });

    await AuditLogger.logActivity({
      actorId: authorId,
      action: "COMMENT_ADDED",
      entityType: "contribution_comment",
      entityId: String(comment.id || contributionId),
      serviceCategory: "review_queue",
      status: "SUCCESS",
      metadata: {
        contributionId,
        fieldName: cleanFieldName,
        message,
      },
    });

    return comment;
  }

  async updateCommentStatus(
    commentId: string,
    actorId: string,
    payload: { status: CommentStatus; fieldValueToAccept?: unknown },
  ) {
    const { status, fieldValueToAccept } = payload;
    const patchData: Record<string, unknown> = { status };

    if (status === "resolved") {
      patchData.resolved_at = new Date().toISOString();
      patchData.resolved_by = actorId;
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
          actor_id: actorId,
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
            userId: actorId,
            errorMessage: error.message || "Failed to award points for accepted comment",
            serviceCategory: "review_queue",
            stackTrace: error.stack,
            code: "AWARD_COMMENT_POINTS_FAILED",
            metadata: { commentId, commentAuthorId },
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
      actor_id: actorId,
      type: historyTypeMap[status],
      message: historyMessage,
    });

    await AuditLogger.logActivity({
      actorId,
      action: `COMMENT_${status.toUpperCase()}`,
      entityType: "contribution_comment",
      entityId: commentId,
      serviceCategory: "review_queue",
      status: "SUCCESS",
      metadata: {
        contributionId,
        commentStatus: status,
        fieldValueToAccept: fieldValueToAccept ?? null,
      },
    });

    return this.repository.fetchCommentById(commentId);
  }
}

export const reviewQueueService = new ReviewQueueService();