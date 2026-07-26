// src/hooks/use-contribution-workflow.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReviewQueueService } from "@/lib/services/admin/reviewqueue-service";
import { ContributionStatus, ContributionFilters } from "@himvirasat/shared";
import { toast } from "sonner";

export const workflowKeys = {
  all: ["contributions"] as const,
  lists: (filters: ContributionFilters) =>
    [...workflowKeys.all, "list", filters] as const,
  detail: (id: string) => [...workflowKeys.all, "detail", id] as const,
};

// 1. Hook to track the active sidebar queue
export function useContributionsQueue(filters: ContributionFilters = {}) {
  return useQuery({
    queryKey: workflowKeys.lists(filters),
    queryFn: () => ReviewQueueService.getAll(filters),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

// 2. Hook to observe single item work canvas parameters
export function useContributionDetail(id: string) {
  return useQuery({
    queryKey: workflowKeys.detail(id),
    queryFn: () => ReviewQueueService.getById(id),
    enabled: !!id,
  });
}

// 3. Mutation hooks for State Machine layout changes
export function useUpdateContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      ReviewQueueService.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      queryClient.invalidateQueries({
        queryKey: workflowKeys.detail(variables.id),
      });
      toast.success("Vocabulary core fields updated securely.");
    },
    onError: (error: any) => {
      toast.error(`Update failed: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      queryClient.invalidateQueries({ queryKey: workflowKeys.detail(data.id) });
      toast.success(
        `Entry successfully transitioned to ${data.status.replace("_", " ")}.`
      );
    },
    onError: (error: any) => {
      toast.error(`Workflow failure: ${error.message}`);
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
      queryClient.invalidateQueries({
        queryKey: workflowKeys.detail(variables.id),
      });
      toast.success("Review workspace note recorded.");
    },
    onError: (error: any) => {
      toast.error(`Failed to post feedback: ${error.message}`);
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
      // Ensure this method exists in your ReviewQueueService!
      ReviewQueueService.updateCommentStatus(contributionId, commentId, status),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific detail view to refresh the UI
      queryClient.invalidateQueries({ queryKey: workflowKeys.all });
      queryClient.invalidateQueries({
        queryKey: workflowKeys.detail(variables.contributionId),
      });

      // Note: We don't need a toast.success here because the WorkspaceContent
      // component handles the success toast locally for this specific action.
    },
    onError: (error: any) => {
      toast.error(`Failed to update comment: ${error.message}`);
    },
  });
}
