"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Contribution,
  ContributionStatus,
  SystemRole,
} from "@/types/admin/FSM/contribution-rules";

// IMPORT YOUR MEMORY DATASET HERE
import { sharedMockDataset } from "@/types/admin/FSM/mockstore";

// Component Imports
import QueueSidebar from "@/components/admin/review-queue/queue-sidebar";
import WorkspaceHeader from "@/components/admin/review-queue/workspace-header";
import WorkspaceContent from "@/components/admin/review-queue/workspace-content";

export default function ReviewQueueDashboardPage() {
  const [activeUser, setActiveUser] = useState({
    id: "usr_expert_77",
    username: "Jasper Dahl",
    role: "language_expert" as SystemRole,
  });

  // State initialized completely from our shared global memory module
  const [items, setItems] = useState<Contribution[]>(sharedMockDataset);

  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [queueTab, setQueueTab] = useState<"pipeline" | "my_submissions">(
    "pipeline"
  );
  const [filterStatus, setFilterStatus] = useState<ContributionStatus | "all">(
    "all"
  );
  const [reviewerComment, setReviewerComment] = useState("");
  const [workspaceTab, setWorkspaceTab] = useState<"content" | "activity">(
    "content"
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contribution>>({});

  // Dynamic initialization for the selected item id on mount
  useEffect(() => {
    if (items.length > 0 && !selectedId) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  // Keep the global shared dataset in sync when mutations happen
  const syncWithGlobalStore = (updatedItems: Contribution[]) => {
    setItems(updatedItems);
    sharedMockDataset.length = 0; // Clear array contents without losing reference
    sharedMockDataset.push(...updatedItems); // Repopulate with updated items
  };

  const queueFilteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQueue =
        queueTab === "my_submissions"
          ? item.contributor_id === activeUser.id
          : item.contributor_id !== activeUser.id;

      const matchesStatus =
        filterStatus === "all" ? true : item.status === filterStatus;

      const matchesSearch =
        item.word_devanagari
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.word_latin &&
          item.word_latin.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.dialect.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesQueue && matchesStatus && matchesSearch;
    });
  }, [items, queueTab, filterStatus, searchQuery, activeUser.id]);

  const currentItem = useMemo(() => {
    return (
      items.find((i) => i.id === selectedId) || queueFilteredItems[0] || null
    );
  }, [items, selectedId, queueFilteredItems]);

  const handleSelectItem = (id: string) => {
    setSelectedId(id);
    setReviewerComment("");
    setIsEditMode(false);
  };

  const startEditing = () => {
    if (!currentItem) return;
    setEditForm({ ...currentItem });
    setIsEditMode(true);
  };

  const saveInlineEdits = () => {
    if (!currentItem || !editForm.word_devanagari) return;
    const updated = items.map((item) =>
      item.id === currentItem.id
        ? ({
            ...item,
            ...editForm,
            updated_at: new Date().toISOString(),
          } as Contribution)
        : item
    );
    syncWithGlobalStore(updated);
    setIsEditMode(false);
  };

  const handleApprove = (id: string) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;
      let nextStatus: ContributionStatus = item.status;
      let l1 = item.level1_reviewer_id;
      let l2 = item.level2_reviewer_id;

      if (item.status === "pending_review_1") {
        nextStatus = "pending_review_2";
        l1 = activeUser.id;
      } else if (item.status === "pending_review_2") {
        nextStatus = "fully_approved";
        l2 = activeUser.id;
      } else if (item.status === "questionable" || item.status === "draft") {
        nextStatus = "pending_review_1";
      }

      return {
        ...item,
        status: nextStatus,
        level1_reviewer_id: l1,
        level2_reviewer_id: l2,
        updated_at: new Date().toISOString(),
      };
    });

    syncWithGlobalStore(updated);
    setReviewerComment("");
  };

  const handleFlag = (id: string) => {
    if (!reviewerComment.trim()) {
      alert(
        "Verification reasoning summary is required inside the logs panel before flagging entries."
      );
      return;
    }
    const updated = items.map((item) =>
      item.id === id
        ? ({
            ...item,
            status: "questionable",
            questionable_by: activeUser.username,
            questionable_reason: reviewerComment,
            updated_at: new Date().toISOString(),
          } as Contribution)
        : item
    );

    syncWithGlobalStore(updated);
    setReviewerComment("");
  };

  const handleReject = (id: string) => {
    if (!reviewerComment.trim()) {
      alert(
        "Verification reasoning summary is required inside the logs panel before rejecting entries."
      );
      return;
    }
    const updated = items.filter((item) => item.id !== id);
    syncWithGlobalStore(updated);
    setReviewerComment("");
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
              Linguistic Verification Pipeline
              <Badge
                variant="secondary"
                className="text-[10px] py-0 px-1.5 font-mono font-normal"
              >
                v2.4-fsm
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
            (r) => (
              <button
                key={r}
                onClick={() => {
                  setActiveUser((p) => ({ ...p, role: r }));
                  setIsEditMode(false);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all capitalize data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs data-[active=true]:border data-[active=true]:text-xs text-muted-foreground hover:text-foreground"
                data-active={activeUser.role === r}
              >
                {r.replace("_", " ")}
              </button>
            )
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 flex w-full overflow-hidden">
        <QueueSidebar
          queueTab={queueTab}
          setQueueTab={setQueueTab}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
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
              />
              <WorkspaceContent
                currentItem={currentItem}
                activeUser={activeUser}
                workspaceTab={workspaceTab}
                isEditMode={isEditMode}
                editForm={editForm}
                setEditForm={setEditForm}
                reviewerComment={reviewerComment}
                setReviewerComment={setReviewerComment}
                handleApprove={handleApprove}
                handleFlag={handleFlag}
                handleReject={handleReject}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground text-center">
              <ShieldCheck className="size-10 stroke-[1.2] text-muted-foreground/40 mb-2" />
              <h3 className="text-sm font-bold text-foreground/80">
                Queue Context Unselected
              </h3>
              <p className="text-xs max-w-xs mt-1 opacity-70">
                Pick a vocabulary data node item from the active side pipeline
                index array stack to trace state telemetry flags.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
