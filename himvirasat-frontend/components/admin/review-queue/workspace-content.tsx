"use client";

import React, { useMemo, useState, lazy, Suspense } from "react";
import { toast } from "sonner";
import {
  Clock,
  Flag,
  Lock,
  MessageSquarePlus,
  ShieldAlert,
  Trash2,
  User,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  Contribution,
  CommentStatus,
  SystemRole,
  WORKFLOW_RULES,
  getOpenReviewCommentCount,
  isAuthorityRole,
  ContributionStatus,
} from "@/types/admin/contribution-types";

import {
  useTransitionStatus,
  useAddReviewComment,
  useUpdateCommentStatus,
} from "@/hooks/use-contribution-workflow";

// Lazy-loaded sub-components
const WorkspaceViewContent = lazy(() => import("./workspace-view-content"));
const WorkspaceEditContent = lazy(() => import("./workspace-edit-content"));

interface WorkspaceContentProps {
  currentItem: Contribution;
  activeUser: { id: string; username: string; role: SystemRole };
  workspaceTab: "content" | "comments" | "activity";
  isEditMode: boolean;
  editForm: Partial<Contribution>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Contribution>>>;
}

const fieldOptions = [
  "General",
  "Devanagari",
  "Latin Text",
  "Takri",
  "IPA",
  "Meaning",
  "Hindi Meaning",
  "English Meaning",
  "Example Sentence",
  "Region",
  "Category",
];

const statusStyles: Record<CommentStatus, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  resolved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  accepted: "bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function WorkspaceContent({
  currentItem,
  activeUser,
  workspaceTab,
  isEditMode,
  editForm,
  setEditForm,
}: WorkspaceContentProps) {
  const [commentField, setCommentField] = useState("General");
  const [commentMessage, setCommentMessage] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isFlagOpen, setIsFlagOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const statusMutation = useTransitionStatus();
  const addCommentMutation = useAddReviewComment();
  const updateCommentMutation = useUpdateCommentStatus();

  const rules = WORKFLOW_RULES[currentItem.status] || {
    label: "Draft",
    canComment: () => true,
    canApprove: () => false,
    canReject: () => true,
    canFlag: () => false,
    canRemoveFlag: () => false,
  };

  const openCommentCount = getOpenReviewCommentCount(currentItem);
  const isContributor = currentItem.contributor_id === activeUser.id;
  const canComment = rules.canComment(activeUser.id, currentItem, activeUser.role);
  const canApprove = rules.canApprove(activeUser.id, currentItem, activeUser.role);
  const canOverride =
    isAuthorityRole(activeUser.role) &&
    (currentItem.status === "under_review" || currentItem.status === "flagged");
  const approvalLocked =
    currentItem.status === "under_review" && openCommentCount > 0 && !canApprove;

  const latestHistory = useMemo(
    () =>
      (currentItem.history || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [currentItem.history]
  );

  const submitComment = () => {
    if (!commentMessage.trim()) return;
    addCommentMutation.mutate(
      { id: currentItem.id, fieldName: commentField, message: commentMessage.trim() },
      {
        onSuccess: () => {
          toast.success("Review comment added successfully.");
          setCommentField("General");
          setCommentMessage("");
        },
        onError: (err: any) => toast.error(err?.message || "Failed to add comment."),
      }
    );
  };

  const handleStatusTransition = (status: ContributionStatus, reason?: string) => {
    statusMutation.mutate(
      { id: currentItem.id, status, reason },
      {
        onSuccess: () => {
          toast.success(`Entry marked as ${status.replace("_", " ")}`);
          setIsFlagOpen(false);
          setIsRejectOpen(false);
          setFlagReason("");
          setRejectReason("");
        },
        onError: (err: any) => toast.error(err?.message || "Workflow transition failed."),
      }
    );
  };

  const handleCommentStatusChange = (commentId: string, status: CommentStatus) => {
    updateCommentMutation.mutate(
      { contributionId: currentItem.id, commentId, status },
      {
        onSuccess: () => toast.success(`Comment status updated to ${status}`),
        onError: (err: any) => toast.error(err?.message || "Failed to update comment status."),
      }
    );
  };

  return (
    <>
      <ScrollArea className="flex-1 min-h-0 px-8 py-6 bg-transparent">
        <div className="max-w-3xl space-y-6">
          {workspaceTab === "content" && (
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-2/3" />
                </div>
              }
            >
              {!isEditMode ? (
                <WorkspaceViewContent currentItem={currentItem} />
              ) : (
                <WorkspaceEditContent editForm={editForm} setEditForm={setEditForm} />
              )}
            </Suspense>
          )}

          {workspaceTab === "comments" && (
            <div className="space-y-4">
              {canComment && (
                <Card className="rounded-lg py-0 shadow-none bg-card/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <MessageSquarePlus className="size-3.5" /> Add Review Comment
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select value={commentField} onValueChange={setCommentField}>
                        <SelectTrigger size="sm" className="w-full sm:w-48 bg-background">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map((field) => (
                            <SelectItem key={field} value={field}>
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={commentMessage}
                        onChange={(e) => setCommentMessage(e.target.value)}
                        placeholder="Leave a concise review note or suggested change."
                        className="min-h-20 text-xs bg-background"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white min-w-30"
                        disabled={!commentMessage.trim() || addCommentMutation.isPending}
                        onClick={submitComment}
                      >
                        {addCommentMutation.isPending ? (
                          <Loader2 className="size-3.5 animate-spin mr-1.5" />
                        ) : null}
                        {addCommentMutation.isPending ? "Posting..." : "Add Comment"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!currentItem.review_comments || currentItem.review_comments.length === 0 ? (
                <div className="rounded-xl border border-border/50 bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                  No review comments have been added.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentItem.review_comments.map((comment) => {
                    const authorName = comment.users?.username || comment.author_id;

                    return (
                      <Card key={comment.id} className="rounded-lg py-0 shadow-none">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar size="sm">
                              <AvatarFallback>{initials(authorName)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-bold text-foreground">{authorName}</p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {new Date(comment.created_at).toLocaleString()}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={cn("text-[10px] capitalize", statusStyles[comment.status])}
                                >
                                  {comment.status}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                  {comment.field_name || "General"}
                                </p>
                                <p className="text-sm text-foreground leading-relaxed">
                                  {comment.message}
                                </p>
                              </div>
                              {isContributor && comment.status === "open" && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    disabled={updateCommentMutation.isPending}
                                    onClick={() => handleCommentStatusChange(comment.id, "accepted")}
                                  >
                                    Accept suggestion
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    disabled={updateCommentMutation.isPending}
                                    onClick={() => handleCommentStatusChange(comment.id, "rejected")}
                                  >
                                    Reject suggestion
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    disabled={updateCommentMutation.isPending}
                                    onClick={() => handleCommentStatusChange(comment.id, "resolved")}
                                  >
                                    Mark resolved
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {workspaceTab === "activity" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  User Information
                </h3>
                <div className="border border-border/40 rounded-xl bg-card/50 dark:bg-card/20 divide-y divide-border/40 text-xs">
                  <div className="p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <User className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {currentItem.contributor_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Initial Entry</p>
                      </div>
                    </div>
                    <span className="font-mono text-muted-foreground/80 text-[11px]">
                      {new Date(currentItem.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  History
                </h3>
                <div className="rounded-xl border border-border/40 bg-card/40 divide-y divide-border/40">
                  {latestHistory.map((event) => (
                    <div key={event.id} className="p-3 flex items-start gap-3 text-xs">
                      <Clock className="size-3.5 text-muted-foreground mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{event.message}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {event.users?.username || event.actor_id} ·{" "}
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {event.type.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t border-border bg-card/90 dark:bg-background/95 backdrop-blur px-6 py-3 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)] relative z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/80 dark:bg-muted/40 px-2.5 py-1 rounded-md border border-border/60">
            <Clock className="size-3 text-indigo-500" />
            <span>
              Role:{" "}
              <span className="font-bold text-foreground capitalize">
                {activeUser.role.replace("_", " ")}
              </span>
              {openCommentCount > 0 && <span className="ml-2">{openCommentCount} unresolved</span>}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {rules.canReject(activeUser.role) && currentItem.status !== "rejected" && (
              <ReasonDialog
                open={isRejectOpen}
                onOpenChange={setIsRejectOpen}
                title="Reject Entry"
                description="Rejecting closes this contribution and records the reason in history."
                reason={rejectReason}
                setReason={setRejectReason}
                reasonLabel="Rejection Reason"
                isPending={statusMutation.isPending}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10 px-3 rounded-lg"
                  >
                    <Trash2 className="size-3.5 mr-1.5" /> Reject
                  </Button>
                }
                actionLabel="Reject Entry"
                actionClassName="bg-destructive hover:bg-destructive/90 text-white"
                onConfirm={() => handleStatusTransition("rejected", rejectReason.trim())}
              />
            )}

            {rules.canRemoveFlag(activeUser.role) && currentItem.status === "flagged" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-background min-w-30"
                onClick={() => handleStatusTransition("under_review")}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? (
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                ) : (
                  <ShieldAlert className="size-3.5 mr-1.5" />
                )}
                {statusMutation.isPending ? "Updating..." : "Remove Flag"}
              </Button>
            )}

            {rules.canFlag(activeUser.id, currentItem, activeUser.role) &&
              currentItem.status !== "flagged" && (
                <ReasonDialog
                  open={isFlagOpen}
                  onOpenChange={setIsFlagOpen}
                  title="Flag Entry"
                  description="Flagged entries move to the dedicated authority review queue."
                  reason={flagReason}
                  setReason={setFlagReason}
                  reasonLabel="Flag Reason"
                  isPending={statusMutation.isPending}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold border-amber-500/30 text-amber-600 bg-background hover:bg-amber-500/5 px-3 rounded-lg"
                    >
                      <Flag className="size-3.5 mr-1.5" /> Flag
                    </Button>
                  }
                  actionLabel="Flag Entry"
                  actionClassName="bg-amber-600 hover:bg-amber-700 text-white"
                  onConfirm={() => handleStatusTransition("flagged", flagReason.trim())}
                />
              )}

            {canApprove || canOverride ? (
              <Button
                size="sm"
                onClick={() => handleStatusTransition("approved")}
                disabled={statusMutation.isPending}
                className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg shadow-sm min-w-30"
              >
                {statusMutation.isPending ? (
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5 mr-1.5" />
                )}
                {openCommentCount > 0 && canOverride ? "Override & Approve" : "Approve"}
              </Button>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-muted/60 dark:bg-muted/30 border border-border/80 px-3.5 h-8 rounded-lg select-none">
                <Lock className="size-3.5" />
                {approvalLocked ? "Resolve comments before approval" : "No review action available"}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  reason,
  setReason,
  reasonLabel,
  trigger,
  actionLabel,
  actionClassName,
  onConfirm,
  isPending,
}: any) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setReason("");
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-background border border-border max-w-md rounded-2xl shadow-xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm font-bold text-foreground">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            {reasonLabel} <span className="text-destructive">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Add a specific reason."
            className="min-h-18 text-xs bg-muted/20 text-foreground border-border rounded-lg resize-none"
          />
        </div>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={isPending}
            className="h-8 text-xs rounded-lg border border-border bg-background text-foreground m-0"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            size="sm"
            className={cn("h-8 text-xs font-semibold rounded-lg px-4 min-w-25", actionClassName)}
            disabled={!reason.trim() || isPending}
            onClick={onConfirm}
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
            {isPending ? "Executing..." : actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}