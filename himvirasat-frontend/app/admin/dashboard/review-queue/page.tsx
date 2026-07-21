"use client";

import React, { useState, useMemo } from "react";
import { ContributionStatus } from "@/types/admin/contribution-types";
import {
  useContributionsQueue,
  useContributionDetail,
  useUpdateContribution,
} from "@/hooks/use-contribution-workflow";
import { useCurrentUser } from "@/hooks/use-current-user";
import QueueSidebar, {
  QueueFilter,
} from "@/components/admin/review-queue/queue-sidebar";
import WorkspaceHeader from "@/components/admin/review-queue/workspace-header";
import WorkspaceContent from "@/components/admin/review-queue/workspace-content";

export default function ReviewQueueDashboardPage() {
  // 1. Live User Session from React Query
  const { data: activeUser, isLoading: isLoadingUser } = useCurrentUser();

  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("under_review");
  const [workspaceTab, setWorkspaceTab] = useState<
    "content" | "comments" | "activity"
  >("content");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // 2. Data Hooks
  const backendStatusFilter =
    queueFilter === "my_submissions"
      ? undefined
      : (queueFilter as ContributionStatus);
  const { data: items = [] } = useContributionsQueue({
    status: backendStatusFilter,
  });
  const { data: currentItem } = useContributionDetail(selectedId);

  // 3. Mutation Hooks
  const { mutate: updateContribution } = useUpdateContribution();

  // 4. Computed Stats & Filters
  const statusCounts = useMemo(() => {
    return (items ?? []).reduce(
      (counts, item) => ({
        ...counts,
        [item.status]: (counts[item.status as keyof typeof counts] || 0) + 1,
      }),
      { under_review: 0, approved: 0, flagged: 0, rejected: 0 }
    );
  }, [items]);

  const queueFilteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return (items ?? []).filter((item) => {
      const matchesFilter =
        queueFilter === "my_submissions"
          ? item.contributor_id === activeUser?.id && item.status !== "approved"
          : item.status === queueFilter;

      const searchable = [item.id, item.word_devanagari, item.word_latin]
        .join(" ")
        .toLowerCase();
      return matchesFilter && searchable.includes(normalizedSearch);
    });
  }, [items, queueFilter, searchQuery, activeUser?.id]);

  // Handlers
  const startEditing = () => {
    if (!currentItem) return;
    setEditForm(currentItem);
    setIsEditMode(true);
  };

  const saveInlineEdits = () => {
    if (!currentItem) return;
    updateContribution({ id: currentItem.id, updates: editForm });
    setIsEditMode(false);
  };

  // 5. Auth & Loading Guards
  if (isLoadingUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading user session...
        </p>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            Unauthorized Access
          </p>
          <p className="text-xs text-muted-foreground">
            No valid login token found. Please log in to view the queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background border-t">
      {/* Header UI using real activeUser data */}
      <header className="h-14 shrink-0 flex items-center justify-between border-b px-6 bg-card/60">
        <span className="text-sm font-semibold">Review Queue</span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            User:{" "}
            <strong className="text-foreground font-medium">
              {activeUser.username || activeUser.email}
            </strong>
          </span>
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono capitalize">
            {activeUser.role}
          </span>
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
          handleSelectItem={setSelectedId}
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
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select an item to begin.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
