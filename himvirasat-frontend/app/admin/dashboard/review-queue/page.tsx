"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Contribution,
  ContributionHistoryEvent,
  ContributionStatus,
  ReviewComment,
  SystemRole,
  getOpenReviewCommentCount,
} from "@/types/admin/FSM/contribution-rules";
import { sharedMockDataset } from "@/types/admin/FSM/mockstore";
import QueueSidebar, {
  QueueFilter,
} from "@/components/admin/review-queue/queue-sidebar";
import WorkspaceHeader from "@/components/admin/review-queue/workspace-header";
import WorkspaceContent from "@/components/admin/review-queue/workspace-content";

export type ActiveUser = {
  id: string;
  username: string;
  role: SystemRole;
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;

const now = () => new Date().toISOString();

const makeHistoryEvent = (
  activeUser: ActiveUser,
  type: ContributionHistoryEvent["type"],
  message: string
): ContributionHistoryEvent => ({
  id: createId("HE"),
  type,
  actor_id: activeUser.id,
  actor_name: activeUser.username,
  message,
  created_at: now(),
});

export default function ReviewQueueDashboardPage() {
  const [activeUser, setActiveUser] = useState<ActiveUser>({
    id: "usr_expert_77",
    username: "Jasper Dahl",
    role: "language_expert",
  });
  const [items, setItems] = useState<Contribution[]>(sharedMockDataset);
  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("under_review");
  const [workspaceTab, setWorkspaceTab] = useState<
    "content" | "comments" | "activity"
  >("content");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contribution>>({});

  const syncWithGlobalStore = (updatedItems: Contribution[]) => {
    setItems(updatedItems);
    sharedMockDataset.length = 0;
    sharedMockDataset.push(...updatedItems);
  };

  const statusCounts = useMemo(
    () =>
      items.reduce(
        (counts, item) => ({
          ...counts,
          [item.status]: counts[item.status] + 1,
        }),
        {
          // draft: 0,
          under_review: 0,
          approved: 0,
          flagged: 0,
          rejected: 0,
        } satisfies Record<ContributionStatus, number>
      ),
    [items]
  );

  const queueFilteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter =
        queueFilter === "my_submissions"
          ? item.contributor_id === activeUser.id && item.status !== "approved"
          : item.status === queueFilter;

      const searchable = [
        item.id,
        item.word_devanagari,
        item.word_latin,
        item.dialect,
        item.category,
        item.contributor_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && searchable.includes(normalizedSearch);
    });
  }, [activeUser.id, items, queueFilter, searchQuery]);

  const currentItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  useEffect(() => {
    if (queueFilteredItems.length === 0) {
      setSelectedId("");
      return;
    }

    const selectionStillVisible = queueFilteredItems.some(
      (item) => item.id === selectedId
    );

    if (!selectionStillVisible) {
      setSelectedId(queueFilteredItems[0].id);
    }
  }, [queueFilteredItems, selectedId]);

  const updateContribution = (
    id: string,
    updater: (item: Contribution) => Contribution
  ) => {
    syncWithGlobalStore(
      items.map((item) => (item.id === id ? updater(item) : item))
    );
  };

  const handleSelectItem = (id: string) => {
    setSelectedId(id);
    setIsEditMode(false);
  };

  const startEditing = () => {
    if (!currentItem) return;
    setEditForm({ ...currentItem });
    setIsEditMode(true);
  };

  const saveInlineEdits = () => {
    if (!currentItem || !editForm.word_devanagari?.trim()) return;

    updateContribution(currentItem.id, (item) => ({
      ...item,
      ...editForm,
      history: [
        makeHistoryEvent(activeUser, "edited", "Updated contribution fields."),
        ...item.history,
      ],
      updated_at: now(),
    }));
    setIsEditMode(false);
  };

  const handleAddComment = (id: string, fieldName: string, message: string) => {
    const comment: ReviewComment = {
      id: createId("RC"),
      author_id: activeUser.id,
      author_name: activeUser.username,
      field_name: fieldName === "General" ? null : fieldName,
      message,
      status: "open",
      created_at: now(),
      resolved_at: null,
      resolved_by: null,
    };

    updateContribution(id, (item) => ({
      ...item,
      review_comments: [comment, ...item.review_comments],
      history: [
        makeHistoryEvent(
          activeUser,
          "comment_added",
          `Commented on ${comment.field_name ?? "the entry"}.`
        ),
        ...item.history,
      ],
      updated_at: now(),
    }));
  };

  const handleCommentStatusChange = (
    contributionId: string,
    commentId: string,
    action: "accepted" | "resolved" | "rejected"
  ) => {
    const status = action === "accepted" ? "resolved" : action;
    const eventType =
      action === "accepted"
        ? "comment_accepted"
        : action === "rejected"
          ? "comment_rejected"
          : "comment_resolved";

    updateContribution(contributionId, (item) => ({
      ...item,
      review_comments: item.review_comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              status,
              resolved_at: now(),
              resolved_by: activeUser.id,
            }
          : comment
      ),
      history: [
        makeHistoryEvent(
          activeUser,
          eventType,
          action === "accepted"
            ? "Accepted review suggestion."
            : `Marked review comment as ${status}.`
        ),
        ...item.history,
      ],
      updated_at: now(),
    }));
  };

  const handleApprove = (id: string) => {
    updateContribution(id, (item) => ({
      ...item,
      status: "approved",
      flag_reason: null,
      flagged_by: null,
      approved_by: activeUser.username,
      approved_at: now(),
      history: [
        makeHistoryEvent(
          activeUser,
          "approved",
          getOpenReviewCommentCount(item) > 0
            ? "Approved with authority override for unresolved comments."
            : "Approved after review requirements were satisfied."
        ),
        ...item.history,
      ],
      updated_at: now(),
    }));
    setQueueFilter("approved");
  };

  const handleSubmitForReview = (id: string) => {
    updateContribution(id, (item) => ({
      ...item,
      status: "under_review",
      history: [
        makeHistoryEvent(activeUser, "submitted", "Submitted for review."),
        ...item.history,
      ],
      updated_at: now(),
    }));
    setQueueFilter("under_review");
  };

  const handleFlag = (id: string, reason: string) => {
    updateContribution(id, (item) => ({
      ...item,
      status: "flagged",
      flag_reason: reason,
      flagged_by: activeUser.username,
      history: [
        makeHistoryEvent(activeUser, "flagged", `Flagged entry: ${reason}`),
        ...item.history,
      ],
      updated_at: now(),
    }));
    setQueueFilter("flagged");
  };

  const handleRemoveFlag = (id: string) => {
    updateContribution(id, (item) => ({
      ...item,
      status: "under_review",
      flag_reason: null,
      flagged_by: null,
      history: [
        makeHistoryEvent(activeUser, "flag_removed", "Removed active flag."),
        ...item.history,
      ],
      updated_at: now(),
    }));
    setQueueFilter("under_review");
  };

  const handleReject = (id: string, reason: string) => {
    updateContribution(id, (item) => ({
      ...item,
      status: "rejected",
      rejected_reason: reason,
      rejected_by: activeUser.username,
      history: [
        makeHistoryEvent(activeUser, "rejected", `Rejected entry: ${reason}`),
        ...item.history,
      ],
      updated_at: now(),
    }));
    setQueueFilter("rejected");
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background border-t antialiased font-sans text-sm text-foreground">
      <header className="h-14 shrink-0 flex items-center justify-between border-b px-6 bg-card/60 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/5 text-primary p-2 rounded-lg border border-primary/10 shadow-sm">
            <ShieldCheck className="size-4.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
              Linguistic Review Queue
              <Badge
                variant="secondary"
                className="text-[10px] py-0 px-1.5 font-mono font-normal"
              >
                pr-style
              </Badge>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              User Domain:{" "}
              <span className="font-medium text-foreground">
                {activeUser.username}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border bg-muted/40 p-1 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider font-mono px-2 text-muted-foreground flex items-center gap-1">
            <SlidersHorizontal className="size-3" /> Test Identity Tier:
          </span>
          {(["language_expert", "language_head", "super_admin"] as const).map(
            (role) => (
              <button
                key={role}
                onClick={() => {
                  setActiveUser((previous) => ({ ...previous, role }));
                  setIsEditMode(false);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all capitalize data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs data-[active=true]:border data-[active=true]:text-xs text-muted-foreground hover:text-foreground"
                data-active={activeUser.role === role}
              >
                {role.replace("_", " ")}
              </button>
            )
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 flex w-full overflow-hidden">
        <QueueSidebar
          activeUserId={activeUser.id}
          queueFilter={queueFilter}
          setQueueFilter={setQueueFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          queueFilteredItems={queueFilteredItems}
          selectedId={selectedId}
          handleSelectItem={handleSelectItem}
        />

        <main className="flex-1 min-h-0 flex flex-col relative">
          {currentItem ? (
            <div className="flex-1 min-h-0 flex flex-col justify-between">
              <WorkspaceHeader
                currentItem={currentItem}
                activeUser={activeUser}
                workspaceTab={workspaceTab}
                setWorkspaceTab={setWorkspaceTab}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                startEditing={startEditing}
                saveInlineEdits={saveInlineEdits}
                statusCounts={statusCounts}
              />
              <WorkspaceContent
                currentItem={currentItem}
                activeUser={activeUser}
                workspaceTab={workspaceTab}
                isEditMode={isEditMode}
                editForm={editForm}
                setEditForm={setEditForm}
                handleAddComment={handleAddComment}
                handleCommentStatusChange={handleCommentStatusChange}
                handleApprove={handleApprove}
                handleSubmitForReview={handleSubmitForReview}
                handleFlag={handleFlag}
                handleRemoveFlag={handleRemoveFlag}
                handleReject={handleReject}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground text-center">
              <ShieldCheck className="size-10 stroke-[1.2] text-muted-foreground/40 mb-2" />
              <h3 className="text-sm font-bold text-foreground/80">
                No entries in this queue
              </h3>
              <p className="text-xs max-w-xs mt-1 opacity-70">
                Adjust the filter or search term to review another moderation
                scope.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
