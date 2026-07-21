import { API_URL } from "@/lib/constants";
import {
  Contribution,
  ContributionFilters,
  ReviewComment,
  ContributionStatus,
} from "../../../types/admin/contribution-types";

/**
 * Common fetch helper to parse responses and handle backend error messages
 */
async function handleResponse<T>(
  response: Response,
  defaultError: string
): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || defaultError;
    const reqId = data?.requestId ? ` (Request ID: ${data.requestId})` : "";
    throw new Error(`${errorMsg}${reqId}`);
  }

  return data;
}

export class ReviewQueueService {
  /**
   * Fetch all contributions filterable by status or dialect
   */
  static async getAll(filters?: ContributionFilters): Promise<Contribution[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.dialect_id)
      params.append("dialect_id", String(filters.dialect_id));

    const queryString = params.toString();
    const url = `${API_URL}/reviewqueue${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    const resData = await handleResponse<{
      success: boolean;
      data: Contribution[];
    }>(response, "Failed to fetch contributions queue");

    return resData.data;
  }

  /**
   * Fetch a single word layout complete with threaded comments and historical audit feeds
   */
  static async getById(id: string): Promise<Contribution> {
    const response = await fetch(`${API_URL}/reviewqueue/${id}`, {
      method: "GET",
      credentials: "include",
    });

    const resData = await handleResponse<{
      success: boolean;
      data: Contribution;
    }>(response, `Failed to fetch contribution ${id}`);

    return resData.data;
  }

  /**
   * Initialize or submit a raw contribution layout
   */
  static async create(data: Partial<Contribution>): Promise<Contribution> {
    const response = await fetch(`${API_URL}/reviewqueue`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const resData = await handleResponse<{
      success: boolean;
      data: Contribution;
    }>(response, "Failed to create contribution entry");

    return resData.data;
  }

  /**
   * Save field updates made directly from the workspace inputs
   */
  static async update(
    id: string,
    updates: Partial<Contribution>
  ): Promise<Contribution> {
    const response = await fetch(`${API_URL}/reviewqueue/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const resData = await handleResponse<{
      success: boolean;
      data: Contribution;
    }>(response, "Failed to update contribution data");

    return resData.data;
  }

  /**
   * State machine transitions: handles Approving, Rejecting, or Flagging items
   */
  static async updateStatus(
    id: string,
    status: ContributionStatus,
    reason?: string
  ): Promise<Contribution> {
    const response = await fetch(`${API_URL}/reviewqueue/${id}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, reason }),
    });

    const resData = await handleResponse<{
      success: boolean;
      data: Contribution;
    }>(response, `Failed to update contribution status to ${status}`);

    return resData.data;
  }

  /**
   * Post an administrative review comment against a targeted field canvas
   */
  static async addComment(
    id: string,
    fieldName: string,
    message: string
  ): Promise<ReviewComment> {
    const response = await fetch(`${API_URL}/reviewqueue/${id}/comments`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ field_name: fieldName, message }),
    });

    const resData = await handleResponse<{
      success: boolean;
      data: ReviewComment;
    }>(response, "Failed to add review feedback comment");

    return resData.data;
  }

  /**
   * Permanently purge a submission
   */
  static async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/reviewqueue/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    await handleResponse<{ success: boolean }>(
      response,
      "Failed to delete contribution entry"
    );
  }

  /**
   * Update the status of a specific review comment (e.g., resolved, accepted)
   */
  static async updateCommentStatus(
    contributionId: string,
    commentId: string,
    status: "open" | "resolved" | "rejected" | "accepted"
  ): Promise<ReviewComment> {
    const response = await fetch(
      `${API_URL}/reviewqueue/${contributionId}/comments/${commentId}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    const resData = await handleResponse<{
      success: boolean;
      data: ReviewComment;
    }>(response, `Failed to update comment status to ${status}`);

    return resData.data;
  }
}
