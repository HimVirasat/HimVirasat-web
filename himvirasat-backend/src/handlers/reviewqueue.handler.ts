import { Response, RequestHandler } from "express";
import { randomUUID } from "crypto";
import { supabase } from "../services/supabase.js";
import { ReviewQueueStatus } from "../types/reviewqueue.types.js";
import { logger } from "../utils/logger.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const validReviewQueueStatuses = new Set<ReviewQueueStatus>([
  "under_review",
  "flagged",
  "approved",
  "rejected",
]);

const validCommentStatuses = new Set(["open", "accepted", "resolved", "rejected"]);

const getUserId = (req: AuthenticatedRequest): string | undefined => {
  return req.user?.userId || (req.user as any)?.id;
};

const getRequestLogContext = (req: AuthenticatedRequest, res: Response) => {
  return {
    requestId: res.locals.requestId,
    method: req.method,
    path: req.originalUrl,
    userId: getUserId(req),
  };
};

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

// 1. CREATE Item
export const createReviewQueueHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const contributor_id = getUserId(authReq);

    if (!contributor_id) {
      res.status(401).json({ success: false, error: "Authentication missing." });
      return;
    }

    const cleanData = sanitizeContributionInput(req.body);
    const customUUID = randomUUID();

    const { error: insertError } = await supabase
      .from("contributions")
      .insert([
        {
          ...cleanData,
          id: customUUID,
          contributor_id,
          status: "under_review",
        },
      ]);

    if (insertError) throw insertError;

    const { data, error: fetchError } = await supabase
      .from("contributions")
      .select(CONTRIBUTION_SELECT_QUERY)
      .eq("id", customUUID)
      .single();

    if (fetchError) throw fetchError;

    await supabase.from("contribution_history").insert([
      {
        contribution_id: customUUID,
        actor_id: contributor_id,
        type: "submitted",
        message: "Contribution submitted for review.",
      },
    ]);

    res.status(201).json({ success: true, data: formatContribution(data) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 2. READ All Items
export const getReviewQueueHandler: RequestHandler = async (req, res): Promise<void> => {
  const startedAt = performance.now();
  const authReq = req as AuthenticatedRequest;
  const logContext = getRequestLogContext(authReq, res);

  try {
    const { status, dialect_id } = req.query;
    const statusFilter = typeof status === "string" ? status : undefined;
    const dialectIdFilter = typeof dialect_id === "string" ? dialect_id : undefined;

    if (statusFilter && !validReviewQueueStatuses.has(statusFilter as ReviewQueueStatus)) {
      res.status(400).json({
        success: false,
        error: `Invalid review queue status filter: ${statusFilter}`,
        requestId: res.locals.requestId,
      });
      return;
    }

    let query = supabase.from("contributions").select(CONTRIBUTION_SELECT_QUERY);

    if (statusFilter) query = query.eq("status", statusFilter);
    if (dialectIdFilter) query = query.eq("dialect_id", dialectIdFilter);

    const { data, error } = await query;
    if (error) throw error;

    const formattedList = (data || []).map(formatContribution);

    res.status(200).json({ success: true, data: formattedList });
  } catch (error: any) {
    logger.error("review queue list fetch failed", error, {
      ...logContext,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    });

    res.status(500).json({
      success: false,
      error: error.message,
      requestId: res.locals.requestId,
    });
  }
};

// 3. READ Single Item by ID
export const getReviewQueueByIdHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: item, error: itemError } = await supabase
      .from("contributions")
      .select(CONTRIBUTION_SELECT_QUERY)
      .eq("id", id)
      .single();

    if (itemError || !item) {
      res.status(404).json({ success: false, message: "Review queue item not found" });
      return;
    }

    const { data: comments, error: commentsError } = await supabase
      .from("contribution_comments")
      .select(`
        *,
        users:users!contribution_comments_author_id_fkey(username, full_name)
      `)
      .eq("contribution_id", id)
      .order("created_at", { ascending: true });

    if (commentsError) {
      logger.error("Failed to fetch comments for item", commentsError);
    }

    const { data: history, error: historyError } = await supabase
      .from("contribution_history")
      .select(`
        *,
        users:users!contribution_history_actor_id_fkey(username, full_name)
      `)
      .eq("contribution_id", id)
      .order("created_at", { ascending: false });

    if (historyError) {
      logger.warn("Failed to fetch history for item", historyError);
    }

    res.status(200).json({
      success: true,
      data: {
        ...formatContribution(item),
        review_comments: comments || [],
        history: history || [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. UPDATE Core Fields with Granular Field-Level Diffs
export const updateReviewQueueHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const actor_id = getUserId(authReq);

    if (!actor_id) {
      res.status(401).json({ success: false, error: "Authentication missing." });
      return;
    }

    const { data: currentData, error: currentFetchError } = await supabase
      .from("contributions")
      .select("*")
      .eq("id", id)
      .single();

    if (currentFetchError || !currentData) {
      res.status(404).json({ success: false, error: "Contribution record not found." });
      return;
    }

    const cleanUpdates = sanitizeContributionInput(req.body);

    const diffEntries: { field_name: string; old_value: string; new_value: string }[] = [];

    Object.keys(cleanUpdates).forEach((key) => {
      const oldVal = currentData[key] !== null && currentData[key] !== undefined ? String(currentData[key]) : "";
      const newVal = cleanUpdates[key] !== null && cleanUpdates[key] !== undefined ? String(cleanUpdates[key]) : "";

      if (oldVal !== newVal) {
        diffEntries.push({
          field_name: key,
          old_value: oldVal,
          new_value: newVal,
        });
      }
    });

    if (diffEntries.length === 0) {
      res.status(200).json({ success: true, message: "No field changes detected." });
      return;
    }

    const { error: updateError } = await supabase
      .from("contributions")
      .update(cleanUpdates)
      .eq("id", id);

    if (updateError) throw updateError;

    const historyRows = diffEntries.map((diff) => ({
      contribution_id: id,
      actor_id,
      type: "field_updated",
      field_name: diff.field_name,
      old_value: diff.old_value,
      new_value: diff.new_value,
      message: `Updated [${diff.field_name}]: '${diff.old_value || "empty"}' ➔ '${diff.new_value || "empty"}'`,
    }));

    const { error: historyInsertError } = await supabase.from("contribution_history").insert(historyRows);
    if (historyInsertError) {
      logger.warn("Failed logging individual field changes to contribution_history", historyInsertError);
    }

    const { data: refreshedItem, error: fetchError } = await supabase
      .from("contributions")
      .select(CONTRIBUTION_SELECT_QUERY)
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    res.status(200).json({ success: true, data: formatContribution(refreshedItem) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 5. UPDATE Status Lifecycle
export const updateReviewQueueStatusHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const actor_id = getUserId(authReq);

    if (!actor_id) {
      res.status(401).json({ success: false, error: "Authentication missing." });
      return;
    }

    const { status, reason } = req.body as { status: ReviewQueueStatus; reason?: string };

    const statusUpdates: any = { status };
    let historyType: "flagged" | "flag_removed" | "approved" | "rejected" | "submitted" = "submitted";

    if (status === "flagged") {
      statusUpdates.flag_reason = reason;
      statusUpdates.flagged_by = actor_id;
      statusUpdates.flagged_at = new Date().toISOString();
      historyType = "flagged";
    } else if (status === "approved") {
      statusUpdates.approved_by = actor_id;
      statusUpdates.approved_at = new Date().toISOString();
      historyType = "approved";
    } else if (status === "rejected") {
      statusUpdates.rejected_reason = reason;
      statusUpdates.rejected_by = actor_id;
      historyType = "rejected";
    } else if (status === "under_review") {
      statusUpdates.flag_reason = null;
      historyType = "flag_removed";
    }

    const { error: updateError } = await supabase
      .from("contributions")
      .update(statusUpdates)
      .eq("id", id);

    if (updateError) throw updateError;

    await supabase.from("contribution_history").insert([
      {
        contribution_id: id,
        actor_id,
        type: historyType,
        message: reason || `Status updated to ${status}.`,
      },
    ]);

    const { data: refreshedItem, error: fetchError } = await supabase
      .from("contributions")
      .select(CONTRIBUTION_SELECT_QUERY)
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    res.status(200).json({ success: true, data: formatContribution(refreshedItem) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 6. DELETE Item
export const deleteReviewQueueHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("contributions").delete().eq("id", id);
    if (error) throw error;

    res.status(200).json({ success: true, message: "Review queue item deleted cleanly." });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 7. ADD Comment
export const addReviewQueueCommentHandler: RequestHandler = async (req, res): Promise<void> => {
  const startedAt = performance.now();
  const authReq = req as AuthenticatedRequest;
  const logContext = getRequestLogContext(authReq, res);

  try {
    const { id } = req.params;
    const author_id = getUserId(authReq);
    const { field_name, message } = req.body;

    const cleanFieldName = field_name && field_name.trim() !== "" ? field_name.trim() : "General";
    const cleanMessage = message ? message.trim() : "";

    if (!author_id) {
      res.status(401).json({ success: false, error: "Authentication missing." });
      return;
    }

    if (!cleanMessage) {
      res.status(400).json({ success: false, error: "Comment message cannot be empty." });
      return;
    }

    const { data: comment, error: commentError } = await supabase
      .from("contribution_comments")
      .insert([
        {
          contribution_id: id,
          author_id,
          field_name: cleanFieldName,
          message: cleanMessage,
          status: "open",
        },
      ])
      .select(`
        *,
        users:users!contribution_comments_author_id_fkey(username, full_name)
      `)
      .single();

    if (commentError) {
      logger.error("Supabase comment insert failed", commentError, logContext);
      res.status(400).json({ success: false, error: commentError.message });
      return;
    }

    await supabase.from("contribution_history").insert([
      {
        contribution_id: id,
        actor_id: author_id,
        type: "comment_added",
        message: `Added review comment under [${cleanFieldName}]: "${cleanMessage}"`,
      },
    ]);

    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    logger.error("addReviewQueueCommentHandler failed", error, {
      ...logContext,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    });

    res.status(500).json({ success: false, error: error.message });
  }
};

// 8. UPDATE Comment Status with Optional Field Acceptance
export const updateReviewQueueCommentStatusHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const actor_id = getUserId(authReq);
    const { commentId } = req.params;
    const { status, fieldValueToAccept } = req.body;

    if (!actor_id) {
      res.status(401).json({ success: false, error: "Authentication missing." });
      return;
    }

    if (!validCommentStatuses.has(status)) {
      res.status(400).json({ success: false, error: `Invalid comment status: ${status}` });
      return;
    }

    const patchData: any = { status };
    if (status === "resolved") {
      patchData.resolved_at = new Date().toISOString();
      patchData.resolved_by = actor_id;
    }

    const { data: comment, error } = await supabase
      .from("contribution_comments")
      .update(patchData)
      .eq("id", commentId)
      .select("*, users:users!contribution_comments_author_id_fkey(username, full_name)")
      .single();

    if (error) throw error;

    const authorName = comment.users?.username || comment.users?.full_name || "contributor";
    const fieldName = comment.field_name || "General";

    if (status === "accepted" && fieldValueToAccept !== undefined && fieldName !== "General") {
      const { data: currentData } = await supabase
        .from("contributions")
        .select("*")
        .eq("id", comment.contribution_id)
        .single();

      if (currentData) {
        const oldVal = String(currentData[fieldName] ?? "");

        await supabase
          .from("contributions")
          .update({ [fieldName]: fieldValueToAccept })
          .eq("id", comment.contribution_id);

        await supabase.from("contribution_history").insert([
          {
            contribution_id: comment.contribution_id,
            actor_id,
            type: "field_updated",
            field_name: fieldName,
            old_value: oldVal,
            new_value: String(fieldValueToAccept),
            message: `Accepted comment suggestion for [${fieldName}]: '${oldVal}' ➔ '${fieldValueToAccept}'`,
          },
        ]);
      }
    }

    const historyMessage =
      status === "accepted"
        ? `comment accepted of ${authorName}`
        : status === "rejected"
        ? `comment rejected of ${authorName}`
        : `Marked review comment on [${fieldName}] as ${status}.`;

    await supabase.from("contribution_history").insert([
      {
        contribution_id: comment.contribution_id,
        actor_id,
        type: `comment_${status}`,
        message: historyMessage,
      },
    ]);

    res.status(200).json({ success: true, data: comment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// import { Response, RequestHandler } from "express";
// import { randomUUID } from "crypto";
// import { supabase } from "../services/supabase.js";
// import { ReviewQueueStatus } from "../types/reviewqueue.types.js";
// import { logger } from "../utils/logger.js";
// import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// const validReviewQueueStatuses = new Set<ReviewQueueStatus>([
//   "under_review",
//   "flagged",
//   "approved",
//   "rejected",
// ]);

// const validCommentStatuses = new Set(["open", "accepted", "resolved", "rejected"]);

// const getUserId = (req: AuthenticatedRequest): string | undefined => {
//   return req.user?.userId || (req.user as any)?.id;
// };

// const getRequestLogContext = (req: AuthenticatedRequest, res: Response) => {
//   return {
//     requestId: res.locals.requestId,
//     method: req.method,
//     path: req.originalUrl,
//     userId: getUserId(req),
//   };
// };

// const CONTRIBUTION_SELECT_QUERY = `
//   *,
//   users:users!contributions_contributor_id_fkey(username, full_name),
//   dialects:dialects!contributions_dialect_id_fkey(name),
//   categories:categories!contributions_category_id_fkey(name),
//   parts_of_speech:parts_of_speech!contributions_part_of_speech_id_fkey(name)
// `;

// const formatContribution = (item: any) => {
//   if (!item) return item;
//   return {
//     ...item,
//     contributor_name: item.users?.full_name || item.users?.username || "Contributor",
//     dialect_name: item.dialects?.name || "Standard",
//     category_name: item.categories?.name || "General Vocabulary",
//     part_of_speech_name: item.parts_of_speech?.name || "General",
//   };
// };

// const sanitizeContributionInput = (input: any) => {
//   const {
//     id,
//     categories,
//     dialects,
//     users,
//     parts_of_speech,
//     category_name,
//     dialect_name,
//     contributor_name,
//     part_of_speech_name,
//     review_comments,
//     history,
//     created_at,
//     updated_at,
//     ...cleanColumns
//   } = input || {};

//   return cleanColumns;
// };

// // 1. CREATE Item
// export const createReviewQueueHandler: RequestHandler = async (req, res): Promise<void> => {
//   try {
//     const authReq = req as AuthenticatedRequest;
//     const contributor_id = getUserId(authReq);

//     if (!contributor_id) {
//       res.status(401).json({ success: false, error: "Authentication missing." });
//       return;
//     }

//     const cleanData = sanitizeContributionInput(req.body);
//     const customUUID = randomUUID();

//     const { error: insertError } = await supabase
//       .from("contributions")
//       .insert([
//         {
//           ...cleanData,
//           id: customUUID,
//           contributor_id,
//           status: "under_review",
//         },
//       ]);

//     if (insertError) throw insertError;

//     const { data, error: fetchError } = await supabase
//       .from("contributions")
//       .select(CONTRIBUTION_SELECT_QUERY)
//       .eq("id", customUUID)
//       .single();

//     if (fetchError) throw fetchError;

//     await supabase.from("contribution_history").insert([
//       {
//         contribution_id: customUUID,
//         actor_id: contributor_id,
//         type: "submitted",
//         message: "Contribution submitted for review.",
//       },
//     ]);

//     res.status(201).json({ success: true, data: formatContribution(data) });
//   } catch (error: any) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // 2. READ All Items
// export const getReviewQueueHandler: RequestHandler = async (req, res): Promise<void> => {
//   const startedAt = performance.now();
//   const authReq = req as AuthenticatedRequest;
//   const logContext = getRequestLogContext(authReq, res);

//   try {
//     const { status, dialect_id } = req.query;
//     const statusFilter = typeof status === "string" ? status : undefined;
//     const dialectIdFilter = typeof dialect_id === "string" ? dialect_id : undefined;

//     if (statusFilter && !validReviewQueueStatuses.has(statusFilter as ReviewQueueStatus)) {
//       res.status(400).json({
//         success: false,
//         error: `Invalid review queue status filter: ${statusFilter}`,
//         requestId: res.locals.requestId,
//       });
//       return;
//     }

//     let query = supabase.from("contributions").select(CONTRIBUTION_SELECT_QUERY);

//     if (statusFilter) query = query.eq("status", statusFilter);
//     if (dialectIdFilter) query = query.eq("dialect_id", dialectIdFilter);

//     const { data, error } = await query;
//     if (error) throw error;

//     const formattedList = (data || []).map(formatContribution);

//     res.status(200).json({ success: true, data: formattedList });
//   } catch (error: any) {
//     logger.error("review queue list fetch failed", error, {
//       ...logContext,
//       durationMs: Number((performance.now() - startedAt).toFixed(2)),
//     });

//     res.status(500).json({
//       success: false,
//       error: error.message,
//       requestId: res.locals.requestId,
//     });
//   }
// };

// // 3. READ Single Item by ID
// export const getReviewQueueByIdHandler: RequestHandler = async (req, res): Promise<void> => {
//   try {
//     const { id } = req.params;

//     const { data: item, error: itemError } = await supabase
//       .from("contributions")
//       .select(CONTRIBUTION_SELECT_QUERY)
//       .eq("id", id)
//       .single();

//     if (itemError || !item) {
//       res.status(404).json({ success: false, message: "Review queue item not found" });
//       return;
//     }

//     const { data: comments, error: commentsError } = await supabase
//       .from("contribution_comments")
//       .select(`
//         *,
//         users:users!contribution_comments_author_id_fkey(username, full_name)
//       `)
//       .eq("contribution_id", id)
//       .order("created_at", { ascending: true });

//     if (commentsError) {
//       logger.error("Failed to fetch comments for item", commentsError);
//     }

//     const { data: history, error: historyError } = await supabase
//       .from("contribution_history")
//       .select(`
//         *,
//         users:users!contribution_history_actor_id_fkey(username, full_name)
//       `)
//       .eq("contribution_id", id)
//       .order("created_at", { ascending: false });

//     if (historyError) {
//       logger.warn("Failed to fetch history for item", historyError);
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         ...formatContribution(item),
//         review_comments: comments || [],
//         history: history || [],
//       },
//     });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // 4. UPDATE Core Fields with Granular Field Logging
// export const updateReviewQueueHandler: RequestHandler = async (req, res): Promise<void> => {
//   try {
//     const authReq = req as AuthenticatedRequest;
//     const { id } = req.params;
//     const actor_id = getUserId(authReq);

//     if (!actor_id) {
//       res.status(401).json({ success: false, error: "Authentication missing." });
//       return;
//     }

//     // Fetch existing record to calculate diffs
//     const { data: currentData, error: currentFetchError } = await supabase
//       .from("contributions")
//       .select("*")
//       .eq("id", id)
//       .single();

//     if (currentFetchError || !currentData) {
//       res.status(404).json({ success: false, error: "Contribution record not found." });
//       return;
//     }

//     const cleanUpdates = sanitizeContributionInput(req.body);

//     // Track modified fields
//     const updatedFields = Object.keys(cleanUpdates).filter(
//       (key) => String(currentData[key] ?? "") !== String(cleanUpdates[key] ?? "")
//     );

//     const { error: updateError } = await supabase
//       .from("contributions")
//       .update(cleanUpdates)
//       .eq("id", id);

//     if (updateError) throw updateError;

//     const logMessage =
//       updatedFields.length > 0
//         ? `Updated fields: ${updatedFields.join(", ")}`
//         : "Linguistic data updated in workspace editor.";

//     await supabase.from("contribution_history").insert([
//       {
//         contribution_id: id,
//         actor_id,
//         type: "edited",
//         message: logMessage,
//       },
//     ]);

//     const { data: refreshedItem, error: fetchError } = await supabase
//       .from("contributions")
//       .select(CONTRIBUTION_SELECT_QUERY)
//       .eq("id", id)
//       .single();

//     if (fetchError) throw fetchError;

//     res.status(200).json({ success: true, data: formatContribution(refreshedItem) });
//   } catch (error: any) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // 5. UPDATE Status Lifecycle
// export const updateReviewQueueStatusHandler: RequestHandler = async (req, res): Promise<void> => {
//   try {
//     const authReq = req as AuthenticatedRequest;
//     const { id } = req.params;
//     const actor_id = getUserId(authReq);

//     if (!actor_id) {
//       res.status(401).json({ success: false, error: "Authentication missing." });
//       return;
//     }

//     const { status, reason } = req.body as { status: ReviewQueueStatus; reason?: string };

//     const statusUpdates: any = { status };
//     let historyType: "flagged" | "flag_removed" | "approved" | "rejected" | "submitted" = "submitted";

//     if (status === "flagged") {
//       statusUpdates.flag_reason = reason;
//       statusUpdates.flagged_by = actor_id;
//       statusUpdates.flagged_at = new Date().toISOString();
//       historyType = "flagged";
//     } else if (status === "approved") {
//       statusUpdates.approved_by = actor_id;
//       statusUpdates.approved_at = new Date().toISOString();
//       historyType = "approved";
//     } else if (status === "rejected") {
//       statusUpdates.rejected_reason = reason;
//       statusUpdates.rejected_by = actor_id;
//       historyType = "rejected";
//     } else if (status === "under_review") {
//       statusUpdates.flag_reason = null;
//       historyType = "flag_removed";
//     }

//     const { error: updateError } = await supabase
//       .from("contributions")
//       .update(statusUpdates)
//       .eq("id", id);

//     if (updateError) throw updateError;

//     await supabase.from("contribution_history").insert([
//       {
//         contribution_id: id,
//         actor_id,
//         type: historyType,
//         message: reason || `Status updated to ${status}.`,
//       },
//     ]);

//     const { data: refreshedItem, error: fetchError } = await supabase
//       .from("contributions")
//       .select(CONTRIBUTION_SELECT_QUERY)
//       .eq("id", id)
//       .single();

//     if (fetchError) throw fetchError;

//     res.status(200).json({ success: true, data: formatContribution(refreshedItem) });
//   } catch (error: any) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // 6. DELETE Item
// export const deleteReviewQueueHandler: RequestHandler = async (req, res): Promise<void> => {
//   try {
//     const { id } = req.params;

//     const { error } = await supabase.from("contributions").delete().eq("id", id);
//     if (error) throw error;

//     res.status(200).json({ success: true, message: "Review queue item deleted cleanly." });
//   } catch (error: any) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// // 7. ADD Comment
// export const addReviewQueueCommentHandler: RequestHandler = async (req, res): Promise<void> => {
//   const startedAt = performance.now();
//   const authReq = req as AuthenticatedRequest;
//   const logContext = getRequestLogContext(authReq, res);

//   try {
//     const { id } = req.params;
//     const author_id = getUserId(authReq);
//     const { field_name, message } = req.body;

//     const cleanFieldName = field_name && field_name.trim() !== "" ? field_name.trim() : "General";
//     const cleanMessage = message ? message.trim() : "";

//     if (!author_id) {
//       res.status(401).json({ success: false, error: "Authentication missing." });
//       return;
//     }

//     if (!cleanMessage) {
//       res.status(400).json({ success: false, error: "Comment message cannot be empty." });
//       return;
//     }

//     const { data: comment, error: commentError } = await supabase
//       .from("contribution_comments")
//       .insert([
//         {
//           contribution_id: id,
//           author_id,
//           field_name: cleanFieldName,
//           message: cleanMessage,
//           status: "open",
//         },
//       ])
//       .select(`
//         *,
//         users:users!contribution_comments_author_id_fkey(username, full_name)
//       `)
//       .single();

//     if (commentError) {
//       logger.error("Supabase comment insert failed", commentError, logContext);
//       res.status(400).json({ success: false, error: commentError.message });
//       return;
//     }

//     await supabase.from("contribution_history").insert([
//       {
//         contribution_id: id,
//         actor_id: author_id,
//         type: "comment_added",
//         message: `Added review comment under [${cleanFieldName}]: "${cleanMessage}"`,
//       },
//     ]);

//     res.status(201).json({ success: true, data: comment });
//   } catch (error: any) {
//     logger.error("addReviewQueueCommentHandler failed", error, {
//       ...logContext,
//       durationMs: Number((performance.now() - startedAt).toFixed(2)),
//     });

//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // 8. UPDATE Comment Status with Explicit Author Action Logging
// export const updateReviewQueueCommentStatusHandler: RequestHandler = async (req, res): Promise<void> => {
//   try {
//     const authReq = req as AuthenticatedRequest;
//     const actor_id = getUserId(authReq);
//     const { commentId } = req.params;
//     const { status } = req.body;

//     if (!actor_id) {
//       res.status(401).json({ success: false, error: "Authentication missing." });
//       return;
//     }

//     if (!validCommentStatuses.has(status)) {
//       res.status(400).json({ success: false, error: `Invalid comment status: ${status}` });
//       return;
//     }

//     const patchData: any = { status };
//     if (status === "resolved") {
//       patchData.resolved_at = new Date().toISOString();
//       patchData.resolved_by = actor_id;
//     }

//     const { data: comment, error } = await supabase
//       .from("contribution_comments")
//       .update(patchData)
//       .eq("id", commentId)
//       .select("*, users:users!contribution_comments_author_id_fkey(username, full_name)")
//       .single();

//     if (error) throw error;

//     const authorName = comment.users?.username || comment.users?.full_name || "contributor";
//     const historyMessage =
//       status === "accepted"
//         ? `comment accepted of ${authorName}`
//         : status === "rejected"
//         ? `comment rejected of ${authorName}`
//         : `Marked review comment on [${comment.field_name || "General"}] as ${status}.`;

//     await supabase.from("contribution_history").insert([
//       {
//         contribution_id: comment.contribution_id,
//         actor_id,
//         type: `comment_${status}`,
//         message: historyMessage,
//       },
//     ]);

//     res.status(200).json({ success: true, data: comment });
//   } catch (error: any) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };