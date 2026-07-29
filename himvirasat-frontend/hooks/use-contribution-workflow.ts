import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewQueueService } from "@/lib/services/admin/reviewqueue-service";
import { ContributionStatus, ContributionFilters } from "@himvirasat/shared";
import { toast } from "sonner";

export const workflowKeys = {
  all: ["contributions"] as const,
  lists: () => [...workflowKeys.all, "list"] as const,
  list: (filters: ContributionFilters) =>
    [...workflowKeys.lists(), filters] as const,
  details: () => [...workflowKeys.all, "detail"] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
};

// 1. Hook to track the active sidebar queue
export function useContributionsQueue(filters: ContributionFilters = {}) {
  return useQuery({
    queryKey: workflowKeys.list(filters),
    queryFn: () => ReviewQueueService.getAll(filters),
    staleTime: 1000 * 5, // Consider data fresh for 5 seconds
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

// 2. Hook to observe single item work canvas parameters
export function useContributionDetail(id: string) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => ReviewQueueService.getById(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

// 3. Mutation hooks for State Machine layout changes
export function useUpdateContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      ReviewQueueService.update(id, updates),
    onSuccess: (_, variables) => {
      // Invalidate both lists and this specific detail view
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workflowKeys.detail(variables.id),
      });
      toast.success("Vocabulary core fields updated securely.");
    },
    onError: (error: any) => {
      toast.error(`Update failed: ${error.message || "Unknown error"}`);
    },
  });
}

export function useTransitionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: ContributionStatus;
      reason?: string;
    }) => ReviewQueueService.updateStatus(id, status, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(data.id) });
    },
    onError: (error: any) => {
      toast.error(`Workflow failure: ${error.message || "Unknown error"}`);
    },
  });
}

export function useAddReviewComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      fieldName,
      message,
    }: {
      id: string;
      fieldName: string;
      message: string;
    }) => ReviewQueueService.addComment(id, fieldName, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workflowKeys.detail(variables.id),
      });
    },
    onError: (error: any) => {
      toast.error(
        `Failed to post feedback: ${error.message || "Unknown error"}`
      );
    },
  });
}

export function useUpdateCommentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contributionId,
      commentId,
      status,
    }: {
      contributionId: string;
      commentId: string;
      status: "open" | "resolved" | "rejected" | "accepted";
    }) =>
      ReviewQueueService.updateCommentStatus(contributionId, commentId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workflowKeys.detail(variables.contributionId),
      });
    },
    onError: (error: any) => {
      toast.error(
        `Failed to update comment: ${error.message || "Unknown error"}`
      );
    },
  });
}
