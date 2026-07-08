"use client";

import React from "react";
import {
  Check,
  Edit3,
  FileText,
  History,
  MessageSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Contribution,
  ContributionStatus,
  SystemRole,
  WORKFLOW_RULES,
} from "@/types/admin/FSM/contribution-rules";

interface WorkspaceHeaderProps {
  currentItem: Contribution;
  activeUser: { id: string; role: SystemRole };
  workspaceTab: "content" | "comments" | "activity";
  setWorkspaceTab: (tab: "content" | "comments" | "activity") => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  startEditing: () => void;
  saveInlineEdits: () => void;
  statusCounts: Record<ContributionStatus, number>;
}

const tabs = [
  { id: "content", label: "Entry", icon: FileText },
  { id: "comments", label: "Review Comments", icon: MessageSquare },
  { id: "activity", label: "History", icon: History },
] as const;

export default function WorkspaceHeader({
  currentItem,
  activeUser,
  workspaceTab,
  setWorkspaceTab,
  isEditMode,
  setIsEditMode,
  startEditing,
  saveInlineEdits,
  statusCounts,
}: WorkspaceHeaderProps) {
  return (
    <div className="h-12 shrink-0 border-b px-6 flex items-center justify-between bg-card/20">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex gap-1 text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setWorkspaceTab(tab.id)}
                className={cn(
                  "h-12 px-3 flex items-center gap-1.5 border-b-2 font-medium transition-all",
                  workspaceTab === tab.id
                    ? "border-indigo-600 text-foreground font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
        <div className="hidden xl:flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] font-mono">
            Under Review {statusCounts.under_review}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono">
            Approved {statusCounts.approved}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono">
            Flagged {statusCounts.flagged}
          </Badge>
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
              <Edit3 className="size-3.5 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                onClick={saveInlineEdits}
                className="h-7.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="size-3.5 mr-1" /> Save
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
