"use client";

import React from "react";
import { FileText, History, Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Contribution,
  WORKFLOW_RULES,
} from "@/types/admin/FSM/contribution-rules";

interface WorkspaceHeaderProps {
  currentItem: Contribution;
  activeUser: { id: string; role: any };
  workspaceTab: "content" | "activity";
  setWorkspaceTab: (tab: "content" | "activity") => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  startEditing: () => void;
  saveInlineEdits: () => void;
}

export default function WorkspaceHeader({
  currentItem,
  activeUser,
  workspaceTab,
  setWorkspaceTab,
  isEditMode,
  setIsEditMode,
  startEditing,
  saveInlineEdits,
}: WorkspaceHeaderProps) {
  return (
    <div className="h-12 shrink-0 border-b px-6 flex items-center justify-between bg-card/20">
      <div className="flex items-center gap-4">
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setWorkspaceTab("content")}
            className={cn(
              "h-12 px-3 flex items-center gap-1.5 border-b-2 font-medium transition-all",
              workspaceTab === "content"
                ? "border-indigo-600 text-foreground font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="size-3.5" /> Core Vocabulary Payload
          </button>
          <button
            onClick={() => setWorkspaceTab("activity")}
            className={cn(
              "h-12 px-3 flex items-center gap-1.5 border-b-2 font-medium transition-all",
              workspaceTab === "activity"
                ? "border-indigo-600 text-foreground font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="size-3.5" /> Governance & History
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {WORKFLOW_RULES[currentItem.status].canEdit(
          activeUser.id,
          currentItem,
          activeUser.role
        ) &&
          (!isEditMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={startEditing}
              className="h-7.5 text-xs bg-background"
            >
              <Edit3 className="size-3.5 mr-1" /> Dynamic Edit Mode
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                onClick={saveInlineEdits}
                className="h-7.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="size-3.5 mr-1" /> Commit Revisions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(false)}
                className="h-7.5 text-xs text-muted-foreground"
              >
                <X className="size-3.5" /> Cancel
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
