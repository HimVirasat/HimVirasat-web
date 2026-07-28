import { randomUUID } from "crypto";
import {
  RawContribution,
  ContributionFilters,
  POINT_REWARDS,
} from "@himvirasat/shared";
import { CONTRIBUTION_SELECT_QUERY, reviewQueueRepository, ReviewQueueRepository } from "./reviewqueue.repository.js";
import { logger } from "../../utils/logger.js";
import type { HistoryEventType, CommentStatus } from "@himvirasat/shared";
import { usersRepository } from "../users/users.repository.js"; // Adjust relative import path
export class ReviewQueueService {
  constructor(
    private readonly repository: ReviewQueueRepository = reviewQueueRepository
  ) { }

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

  private sanitizeContributionInput(input: Record<string, unknown> | undefined) {
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

  async createContribution(contributorId: string, _payload: Record<string, unknown>) {
    const customUUID = randomUUID();

    await this.repository.insertHistory({
      contribution_id: customUUID,
      actor_id: contributorId,
      type: "submitted",
      message: "Contribution submitted for review.",
    });

    const enriched = await this.repository.fetchContributionById(
      customUUID,
      CONTRIBUTION_SELECT_QUERY
    );

    return this.formatContribution(enriched);
  }

  async fetchContributions(filters: ContributionFilters) {
    const data = await this.repository.fetchContributions(
      filters,
      CONTRIBUTION_SELECT_QUERY
    );
    return data.map((item) => this.formatContribution(item));
  }

  async fetchContributionById(id: string) {
    const item = await this.repository.fetchContributionById(
      id,
      CONTRIBUTION_SELECT_QUERY
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
    payload: Record<string, unknown>
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
        CONTRIBUTION_SELECT_QUERY
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
          err
        )
      );

    const enriched = await this.repository.fetchContributionById(
      id,
      CONTRIBUTION_SELECT_QUERY
    );

    return this.formatContribution(enriched);
  }
  async updateContributionStatus(
    id: string,
    actorId: string,
    payload: { status: string; reason?: string | undefined }
  ) {
    const { status, reason } = payload;
    const statusUpdates: Record<string, unknown> = { status };
    let historyType: HistoryEventType = "submitted";

    console.log("🔥 UPDATE_STATUS ROUTE ENTERED:", { id, status, actorId });

    // 1. Fetch contribution metadata (ensure primary key UUID is fetched)
    const existingContribution = await this.repository.fetchContributionById(
      id,
      "id, contributor_id, dialect_id, status"
    );

    if (!existingContribution) {
      throw new Error("Contribution not found");
    }

    const previousStatus = existingContribution.status;
    // Ensure we use the real DB UUID for point transaction references
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

    // 2. Update contribution status & log history entry
    await this.repository.updateContribution(id, statusUpdates);

    await this.repository.insertHistory({
      contribution_id: contributionUuid,
      actor_id: actorId,
      type: historyType,
      message: reason || `Status updated to ${status}.`,
    });

    // 3. Award Points only if transitioning to "approved" for the first time
    if (status === "approved" && previousStatus !== "approved") {
      const contributorId = existingContribution.contributor_id as string | undefined;
      const dialectId =
        typeof existingContribution.dialect_id === "number"
          ? existingContribution.dialect_id
          : undefined;

      try {
        // A. Contributor receives points
        if (contributorId) {
          console.log("--> Awarding points to contributor:", {
            contributorId,
            contributionUuid,
          });

          await usersRepository.awardPoints({
            userId: contributorId,
            points: POINT_REWARDS.CONTRIBUTOR_APPROVED,
            reason: "contribution_approved",
            referenceId: contributionUuid, // Must be UUID
            dialectId: dialectId,
            isContributor: true,
          });
        }

        // B. Reviewer receives points (if not self-approving)
        if (actorId && actorId !== contributorId) {
          console.log("--> Awarding points to reviewer:", {
            actorId,
            contributionUuid,
          });

          await usersRepository.awardPoints({
            userId: actorId,
            points: POINT_REWARDS.REVIEWER_APPROVED,
            reason: "review_completed",
            referenceId: contributionUuid, // Must be UUID
            dialectId: dialectId,
            isContributor: false,
          });
        }
      } catch (error) {
        console.error("❌ Failed to award points during status approval:", error);
      }
    }

    // 4. Fetch and return enriched payload
    const enriched = await this.repository.fetchContributionById(
      id,
      CONTRIBUTION_SELECT_QUERY
    );

    return this.formatContribution(enriched);
  }
  async deleteContribution(id: string) {
    await this.repository.deleteContribution(id);
  }

  async addContributionComment(
    contributionId: string,
    authorId: string,
    payload: { field_name: string; message: string }
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

    return comment;
  }

  async updateCommentStatus(
    commentId: string,
    actorId: string,
    payload: { status: CommentStatus; fieldValueToAccept?: unknown }
  ) {
    const { status, fieldValueToAccept } = payload;
    const patchData: Record<string, unknown> = { status };

    if (status === "resolved") {
      patchData.resolved_at = new Date().toISOString();
      patchData.resolved_by = actorId;
    }

    const updatedComment = await this.repository.updateComment(commentId, patchData);
    if (!updatedComment) throw new Error("Comment not found");

    const commentFieldName = (updatedComment.field_name as string) || "General";
    const contributionId = updatedComment.contribution_id as string;

    // 1. If accepted and suggested a new field value, update the contribution field
    if (
      status === "accepted" &&
      fieldValueToAccept !== undefined &&
      commentFieldName !== "General"
    ) {
      const currentData = await this.repository.fetchContributionRaw(
        contributionId
      );

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

    // 2. Award Points if a comment is accepted
    if (status === "accepted") {
      // Extract author ID from comment (adjust key if your column name is user_id / author_id)
      const commentAuthorId = (updatedComment.user_id || updatedComment.author_id) as string | undefined;

      if (commentAuthorId) {
        try {
          await usersRepository.awardPoints({
            userId: commentAuthorId,
            points: POINT_REWARDS.COMMENT_ACCEPTED,
            reason: "comment_accepted",
            referenceId: commentId,
            isContributor: true,
          });
          console.log(`--> Awarded ${POINT_REWARDS.COMMENT_ACCEPTED} points to comment author: ${commentAuthorId}`);
        } catch (error) {
          console.error("❌ Failed to award points for accepted comment:", error);
        }
      }
    }

    // 3. Log event history entry
    const historyTypeMap: Record<CommentStatus, HistoryEventType> = {
      accepted: "comment_accepted",
      rejected: "comment_rejected",
      resolved: "comment_resolved",
      open: "comment_added",
    };

    const users = updatedComment.users as { username?: string; full_name?: string } | undefined;
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

    return this.repository.fetchCommentById(commentId);
  }
}

export const reviewQueueService = new ReviewQueueService();