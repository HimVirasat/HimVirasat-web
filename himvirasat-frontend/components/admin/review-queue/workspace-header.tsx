"use client";

import React, { useState } from "react";
import {
  Check,
  Edit3,
  FileText,
  History,
  MessageSquare,
  X,
  Loader2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Contribution,
  ContributionStatus,
  SystemRole,
  WORKFLOW_RULES,
} from "@himvirasat/shared";
import { toast } from "sonner";

interface WorkspaceHeaderProps {
  currentItem: Contribution;
  activeUser: { id: string; role: SystemRole };
  workspaceTab: "content" | "comments" | "activity";
  setWorkspaceTab: (tab: "content" | "comments" | "activity") => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  startEditing: () => void;
  saveInlineEdits: () => void;
  isSaving?: boolean;
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
  isSaving = false,
  statusCounts,
}: WorkspaceHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!currentItem?.id) return;

    // Build standard share URL pointing to current entry ID
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${currentItem.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Direct link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };
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
            Under Review {statusCounts.under_review || 0}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono">
            Approved {statusCounts.approved || 0}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono">
            Flagged {statusCounts.flagged || 0}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {WORKFLOW_RULES[currentItem.status]?.canEdit(
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
                disabled={isSaving}
                className="h-7.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white min-w-20"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 mr-1 animate-spin" />
                ) : (
                  <Check className="size-3.5 mr-1" />
                )}
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(false)}
                disabled={isSaving}
                className="h-7.5 text-xs text-muted-foreground"
              >
                <X className="size-3.5" /> Cancel
              </Button>
            </div>
          ))}
        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" /> Copied
              </>
            ) : (
              <>
                <Share2 className="size-3.5" /> Share
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
