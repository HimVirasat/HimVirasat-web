import { API_URL } from "@/lib/constants";
import {
  Contribution,
  ContributionFilters,
  ReviewComment,
  ContributionStatus,
  CommentStatus,
  UpdateStatusPayload,
  AddCommentPayload,
  UpdateCommentStatusPayload,
} from "@himvirasat/shared";

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
  static async getAll(filters?: ContributionFilters): Promise<Contribution[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.dialect_name)
      params.append("dialect_name", filters.dialect_name);

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
    console.log(resData.data);
    return resData.data;
  }

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

  static async create(data: Partial<Contribution>): Promise<Contribution> {
    const response = await fetch(`${API_URL}/reviewqueue`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await handleResponse<{
      success: boolean;
      data: Contribution;
    }>(response, "Failed to create contribution entry");

    return resData.data;
  }

  static async update(
    id: string,
    updates: Partial<Contribution>
  ): Promise<Contribution> {
    const response = await fetch(`${API_URL}/reviewqueue/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const resData = await handleResponse<{
      success: boolean;
      data: Contribution;
    }>(response, "Failed to update contribution data");

    return resData.data;
  }

  static async updateStatus(
    id: string,
    status: ContributionStatus,
    reason?: string
  ): Promise<Contribution> {
    console.log("🚀 SENDING UPDATE STATUS FETCH:", { id, status, reason }); // Add this
    const payload: UpdateStatusPayload = { status, reason };

    const response = await fetch(`${API_URL}/reviewqueue/${id}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const resData = await handleResponse<{
      success: boolean;
      data: Contribution;
    }>(response, `Failed to update contribution status to ${status}`);

    return resData.data;
  }

  static async addComment(
    id: string,
    fieldName: string,
    message: string
  ): Promise<ReviewComment> {
    const payload: AddCommentPayload = { field_name: fieldName, message };

    const response = await fetch(`${API_URL}/reviewqueue/${id}/comments`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const resData = await handleResponse<{
      success: boolean;
      data: ReviewComment;
    }>(response, "Failed to add review feedback comment");

    return resData.data;
  }

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

  static async updateCommentStatus(
    contributionId: string,
    commentId: string,
    status: CommentStatus,
    fieldValueToAccept?: any
  ): Promise<ReviewComment> {
    const payload: UpdateCommentStatusPayload = { status, fieldValueToAccept };

    const response = await fetch(
      `${API_URL}/reviewqueue/${contributionId}/comments/${commentId}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const resData = await handleResponse<{
      success: boolean;
      data: ReviewComment;
    }>(response, `Failed to update comment status to ${status}`);

    return resData.data;
  }
}
