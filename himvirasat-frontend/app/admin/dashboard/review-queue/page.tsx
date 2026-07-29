"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ContributionStatus } from "@himvirasat/shared";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const urlItemId = searchParams.get("id") || "";
  const { data: activeUser, isLoading: isLoadingUser } = useCurrentUser();

  const [selectedId, setSelectedId] = useState<string>(urlItemId);
  const [searchQuery, setSearchQuery] = useState("");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("under_review");
  const [workspaceTab, setWorkspaceTab] = useState<
    "content" | "comments" | "activity"
  >("content");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // Flag to ensure initial URL sync runs only ONCE when opening a shared link
  const hasSyncedUrlRef = useRef(false);

  const { data: items = [], isLoading: isLoadingQueue } =
    useContributionsQueue();
  const { data: currentItem, isLoading: isLoadingDetail } =
    useContributionDetail(selectedId);
  const { mutate: updateContribution, isPending: isSaving } =
    useUpdateContribution();

  // 1. Computed Stats & Filters
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

  // 2. Selection & Navigation Handlers
  const handleSelectItem = (id: string) => {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("id", id);
    } else {
      params.delete("id");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (newFilter: QueueFilter) => {
    setQueueFilter(newFilter);

    // Check if the current item exists in the newly selected stage list
    const existsInNewTab = (items ?? []).some((item) => {
      if (newFilter === "my_submissions") {
        return item.id === selectedId && item.contributor_id === activeUser?.id;
      }
      return item.id === selectedId && item.status === newFilter;
    });

    // If selected item doesn't belong to the new tab, clear the selection and URL param
    if (!existsInNewTab) {
      setSelectedId("");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("id");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  // 3. One-Time Sync Effect for Direct Link Navigation
  useEffect(() => {
    if (
      currentItem &&
      urlItemId === currentItem.id &&
      !hasSyncedUrlRef.current
    ) {
      hasSyncedUrlRef.current = true;
      if (currentItem.status && currentItem.status !== queueFilter) {
        setQueueFilter(currentItem.status as QueueFilter);
      }
    }
  }, [currentItem, urlItemId, queueFilter]);

  // 4. Default Fallback Selection when switching tabs if nothing is selected
  useEffect(() => {
    if (!selectedId && queueFilteredItems.length > 0) {
      handleSelectItem(queueFilteredItems[0].id);
    }
  }, [queueFilteredItems, selectedId]);

  const startEditing = () => {
    if (!currentItem) return;
    setEditForm(currentItem);
    setIsEditMode(true);
  };

  const saveInlineEdits = () => {
    if (!currentItem) return;
    updateContribution(
      { id: currentItem.id, updates: editForm },
      {
        onSuccess: () => {
          setIsEditMode(false);
          queryClient.invalidateQueries({ queryKey: ["contributions"] });
        },
      }
    );
  };

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
            Please log in to view the review queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background border-t">
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
          setQueueFilter={handleTabChange} // 👈 Use handleTabChange instead of raw setQueueFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          queueFilteredItems={queueFilteredItems}
          selectedId={selectedId}
          handleSelectItem={handleSelectItem}
          isLoading={isLoadingQueue}
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
                isSaving={isSaving}
                statusCounts={statusCounts}
              />
              <WorkspaceContent
                currentItem={currentItem}
                activeUser={activeUser}
                workspaceTab={workspaceTab}
                isEditMode={isEditMode}
                editForm={editForm}
                setEditForm={setEditForm}
                isLoading={isLoadingDetail}
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
