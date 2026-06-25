"use client";

import React from "react";
import { Search, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Contribution,
  ContributionStatus,
} from "@/types/admin/FSM/contribution-rules";

interface QueueSidebarProps {
  queueTab: "pipeline" | "my_submissions";
  setQueueTab: (tab: "pipeline" | "my_submissions") => void;
  filterStatus: ContributionStatus | "all";
  setFilterStatus: (status: ContributionStatus | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  queueFilteredItems: Contribution[];
  selectedId: string;
  handleSelectItem: (id: string) => void;
}

export default function QueueSidebar({
  queueTab,
  setQueueTab,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  queueFilteredItems,
  selectedId,
  handleSelectItem,
}: QueueSidebarProps) {
  const getStatusBadgeConfig = (status: ContributionStatus) => {
    switch (status) {
      case "pending_review_1":
        return {
          label: "L1 Review Pending",
          style:
            "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
        };
      case "pending_review_2":
        return {
          label: "L2 Review Pending",
          style:
            "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
        };
      case "fully_approved":
        return {
          label: "Finalized / Live",
          style:
            "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
        };
      case "questionable":
        return {
          label: "Flagged Concerns",
          style:
            "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
        };
      default:
        return {
          label: "Unknown",
          style: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400",
        };
    }
  };

  return (
    <aside className="w-85 shrink-0 border-r flex flex-col min-h-0">
      {/* Top Tab Switcher Row */}
      <div className="p-3 pb-0 flex gap-1 border-b">
        <button
          onClick={() => {
            setQueueTab("pipeline");
            setFilterStatus("all");
          }}
          className={cn(
            "flex-1 pb-2.5 text-xs font-semibold border-b-2 text-center transition-all",
            queueTab === "pipeline"
              ? "border-primary text-foreground font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Review Pipeline
        </button>
        <button
          onClick={() => {
            setQueueTab("my_submissions");
            setFilterStatus("all");
          }}
          className={cn(
            "flex-1 pb-2.5 text-xs font-semibold border-b-2 text-center transition-all",
            queueTab === "my_submissions"
              ? "border-primary text-foreground font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          My Submissions
        </button>
      </div>

      {/* Search and Filters Segment */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Find lemma, track code, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8.5 h-8.5 text-xs bg-background/40 backdrop-blur-xs rounded-lg border-border/80"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] scrollbar-none">
          {(
            [
              "all",
              "pending_review_1",
              "pending_review_2",
              "questionable",
            ] as const
          ).map((st) => {
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={cn(
                  "px-2 py-0.5 rounded-md font-medium border shrink-0 transition-all capitalize",
                  filterStatus === st
                    ? "bg-foreground text-background border-foreground font-semibold"
                    : "bg-background/40 backdrop-blur-xs text-muted-foreground border-border hover:text-foreground"
                )}
              >
                {st === "all"
                  ? "All Tracks"
                  : st === "pending_review_1"
                    ? "L1 Queue"
                    : st === "pending_review_2"
                      ? "L2 Queue"
                      : "Flagged"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main List Scroller */}
      <ScrollArea className="flex-1 min-h-0 bg-transparent">
        {queueFilteredItems.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground h-64">
            <Inbox className="size-6 stroke-[1.5] mb-2 text-muted-foreground/50" />
            <p className="text-xs font-semibold text-foreground/80">
              Empty...
            </p>
            <p className="text-[11px] max-w-48 mx-auto mt-0.5 opacity-70">
              No data found.
            </p>
          </div>
        ) : (
          <div className="divide-y border-b border-border/40">
            {queueFilteredItems.map((item) => {
              const isSelected = item.id === selectedId;
              const cfg = getStatusBadgeConfig(item.status);
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  className={cn(
                    "p-3.5 cursor-pointer text-left transition-all relative flex flex-col gap-1.5 group",
                    isSelected
                      ? "bg-accent/40 backdrop-blur-xs after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-indigo-600 dark:after:bg-indigo-400"
                      : "hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm tracking-tight text-foreground">
                      {item.word_devanagari}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground opacity-80">
                      {item.id}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/90 font-medium truncate max-w-72">
                    {item.meaning}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded">
                        {item.dialect}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.category}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] px-1.5 py-0 font-semibold border shadow-none",
                        cfg?.style
                      )}
                    >
                      {cfg?.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}