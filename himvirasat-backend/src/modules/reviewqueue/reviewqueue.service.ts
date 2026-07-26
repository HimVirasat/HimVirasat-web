import { randomUUID } from "crypto";
import * as repository from "./reviewqueue.repository.js";
import { logger } from "../../utils/logger.js";
import { HistoryEventType, CommentStatus } from "@himvirasat/shared";
import { PostgrestError } from "@supabase/supabase-js";

const CONTRIBUTION_SELECT_QUERY = `
  *,
  users:users!contributions_contributor_id_fkey(username, full_name),
  dialects:dialects!contributions_dialect_id_fkey(name),
  categories:categories!contributions_category_id_fkey(name),
  parts_of_speech:parts_of_speech!contributions_part_of_speech_id_fkey(name)
`;

const formatContribution = (item: any) => {
  if (!item) return item;
  return {
    ...item,
    contributor_name: item.users?.full_name || item.users?.username || "Contributor",
    dialect_name: item.dialects?.name || "Standard",
    category_name: item.categories?.name || "General Vocabulary",
    part_of_speech_name: item.parts_of_speech?.name || "General",
  };
};

const sanitizeContributionInput = (input: any) => {
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
};

// ------------------------------------------------------------------
// 1. CREATE
// ------------------------------------------------------------------
export async function createContribution(contributorId: string, _payload: any) {
//   const cleanData = sanitizeContributionInput(payload);
  const customUUID = randomUUID();

//   const contribution = await repository.insertContribution({
//     ...cleanData,
//     id: customUUID,
//     contributor_id: contributorId,
//     status: "under_review",
//   });

  // Log history
  await repository.insertHistory({
    contribution_id: customUUID,
    actor_id: contributorId,
    type: "submitted",
    message: "Contribution submitted for review.",
  });

  // Fetch the enriched version
  const enriched = await repository.fetchContributionById(customUUID, CONTRIBUTION_SELECT_QUERY);
  return formatContribution(enriched);
}

// ------------------------------------------------------------------
// 2. READ (list)
// ------------------------------------------------------------------
export async function fetchContributions(filters: { status?: string | undefined; dialect_id?: number | undefined }) {
  const data = await repository.fetchContributions(filters, CONTRIBUTION_SELECT_QUERY);
  return data.map(formatContribution);
}

// ------------------------------------------------------------------
// 3. READ (single + comments + history)
// ------------------------------------------------------------------
export async function fetchContributionById(id: string) {
  const item = await repository.fetchContributionById(id, CONTRIBUTION_SELECT_QUERY);
  if (!item) return null;

  const comments = await repository.fetchCommentsByContributionId(id);
  const history = await repository.fetchHistoryByContributionId(id);

  return {
    ...formatContribution(item),
    review_comments: comments || [],
    history: history || [],
  };
}

// ------------------------------------------------------------------
// 4. UPDATE (core fields)
// ------------------------------------------------------------------
export async function updateContribution(id: string, actorId: string, payload: any) {
  const currentData = await repository.fetchContributionRaw(id);
  if (!currentData) {
    throw new Error("Contribution record not found.");
  }

  const cleanUpdates = sanitizeContributionInput(payload);

  // Build diff
  const diffEntries: { field_name: string; old_value: string; new_value: string }[] = [];
  Object.keys(cleanUpdates).forEach((key) => {
    const oldVal = currentData[key] !== null && currentData[key] !== undefined ? String(currentData[key]) : "";
    const newVal = cleanUpdates[key] !== null && cleanUpdates[key] !== undefined ? String(cleanUpdates[key]) : "";
    if (oldVal !== newVal) {
      diffEntries.push({ field_name: key, old_value: oldVal, new_value: newVal });
    }
  });

  if (diffEntries.length === 0) {
    // no changes, still return enriched item
    const enriched = await repository.fetchContributionById(id, CONTRIBUTION_SELECT_QUERY);
    return formatContribution(enriched);
  }

  // Update
  await repository.updateContribution(id, cleanUpdates);

  // Log each field change
  const historyRows = diffEntries.map((diff) => ({
    contribution_id: id,
    actor_id: actorId,
    type: "field_updated" as HistoryEventType,
    field_name: diff.field_name,
    old_value: diff.old_value,
    new_value: diff.new_value,
    message: `Updated [${diff.field_name}]: '${diff.old_value || "empty"}' ➔ '${diff.new_value || "empty"}'`,
  }));
  await repository.insertHistoryBatch(historyRows).catch((err: PostgrestError) =>
    logger.warn("Failed logging individual field changes to contribution_history", err)
  );

  // Return enriched
  const enriched = await repository.fetchContributionById(id, CONTRIBUTION_SELECT_QUERY);
  return formatContribution(enriched);
}

// ------------------------------------------------------------------
// 5. UPDATE STATUS
// ------------------------------------------------------------------
export async function updateContributionStatus(id: string, actorId: string, payload: { status: string; reason?: string | undefined }) {
  const { status, reason } = payload;

  const statusUpdates: Record<string, any> = { status };
  let historyType: HistoryEventType = "submitted";

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

  await repository.updateContribution(id, statusUpdates);

  await repository.insertHistory({
    contribution_id: id,
    actor_id: actorId,
    type: historyType,
    message: reason || `Status updated to ${status}.`,
  });

  const enriched = await repository.fetchContributionById(id, CONTRIBUTION_SELECT_QUERY);
  return formatContribution(enriched);
}

// ------------------------------------------------------------------
// 6. DELETE
// ------------------------------------------------------------------
export async function deleteContribution(id: string) {
  await repository.deleteContribution(id);
}

// ------------------------------------------------------------------
// 7. ADD COMMENT
// ------------------------------------------------------------------
export async function addContributionComment(
  contributionId: string,
  authorId: string,
  payload: { field_name: string; message: string }
) {
  const { field_name, message } = payload;
  const cleanFieldName = field_name && field_name.trim() !== "" ? field_name.trim() : "General";

  const comment = await repository.insertComment({
    contribution_id: contributionId,
    author_id: authorId,
    field_name: cleanFieldName,
    message,
    status: "open",
  });

  // History
  await repository.insertHistory({
    contribution_id: contributionId,
    actor_id: authorId,
    type: "comment_added",
    message: `Added review comment under [${cleanFieldName}]: "${message}"`,
  });

  return comment;
}

// ------------------------------------------------------------------
// 8. UPDATE COMMENT STATUS + optional field acceptance
// ------------------------------------------------------------------
export async function updateCommentStatus(
  commentId: string,
  actorId: string,
  payload: { status: CommentStatus; fieldValueToAccept?: any }
) {
  const { status, fieldValueToAccept } = payload;

  const patchData: Record<string, any> = { status };
  if (status === "resolved") {
    patchData.resolved_at = new Date().toISOString();
    patchData.resolved_by = actorId;
  }

  const updatedComment = await repository.updateComment(commentId, patchData);
  if (!updatedComment) throw new Error("Comment not found");

  // If status is "accepted" and we have a field value to apply
  if (status === "accepted" && fieldValueToAccept !== undefined && updatedComment.field_name !== "General") {
    const currentData = await repository.fetchContributionRaw(updatedComment.contribution_id);
    if (currentData) {
      const fieldName = updatedComment.field_name;
      const oldVal = String(currentData[fieldName] ?? "");
      await repository.updateContribution(updatedComment.contribution_id, {
        [fieldName]: fieldValueToAccept,
      });
      await repository.insertHistory({
        contribution_id: updatedComment.contribution_id,
        actor_id: actorId,
        type: "field_updated",
        field_name: fieldName,
        old_value: oldVal,
        new_value: String(fieldValueToAccept),
        message: `Accepted comment suggestion for [${fieldName}]: '${oldVal}' ➔ '${fieldValueToAccept}'`,
      });
    }
  }

  // History for comment status change
  const historyTypeMap: Record<CommentStatus, HistoryEventType> = {
    accepted: "comment_accepted",
    rejected: "comment_rejected",
    resolved: "comment_resolved",
    open: "comment_added",
  };
  const authorName = updatedComment.users?.username || updatedComment.users?.full_name || "contributor";
  const historyMessage =
    status === "accepted"
      ? `comment accepted of ${authorName}`
      : status === "rejected"
      ? `comment rejected of ${authorName}`
      : `Marked review comment on [${updatedComment.field_name}] as ${status}.`;

  await repository.insertHistory({
    contribution_id: updatedComment.contribution_id,
    actor_id: actorId,
    type: historyTypeMap[status],
    message: historyMessage,
  });

  // Re‑fetch comment with user details
  return repository.fetchCommentById(commentId);
}