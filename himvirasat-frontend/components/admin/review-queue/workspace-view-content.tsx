"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, User, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Contribution, WORKFLOW_RULES } from "@himvirasat/shared";

// ------------------------------------------------------------------
// Skeleton loader
// ------------------------------------------------------------------
const ViewContentSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-16" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/40 pb-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="md:col-span-2 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
      </div>
    </div>
    <div className="space-y-4 border-b border-border/40 pb-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-48" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
);

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
interface WorkspaceViewContentProps {
  currentItem?: Contribution | null;
  isLoading?: boolean;
}

export default function WorkspaceViewContent({
  currentItem,
  isLoading = false,
}: WorkspaceViewContentProps) {
  const [showContent, setShowContent] = useState(!isLoading);
  const [startTime] = useState(Date.now());

  // Minimum 500ms loading delay
  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 500 - elapsed);
      const timer = setTimeout(() => setShowContent(true), remaining);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading, startTime]);

  // Still loading – show skeleton
  if (!showContent) {
    return <ViewContentSkeleton />;
  }

  // No item selected
  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm font-medium">No contribution selected</p>
        <p className="text-xs mt-1 opacity-70">
          Select an item from the queue to view details.
        </p>
      </div>
    );
  }

  // --- Content rendering (unchanged) ---
  const rules = WORKFLOW_RULES[currentItem.status] || { label: "unknown" };
  const shortId = currentItem.id.slice(-4);

  return (
    <div className="space-y-6">
      {(currentItem.status === "flagged" ||
        currentItem.status === "rejected") && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3 text-xs">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-400">
              {currentItem.status === "flagged"
                ? "Active Flag"
                : "Rejected Entry"}
            </span>
            <p className="text-foreground font-medium">
              {currentItem.status === "flagged"
                ? currentItem.flag_reason
                : currentItem.rejected_reason}
            </p>
          </div>
        </div>
      )}

      {/* Header Metadata with Short ID */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/40">
          ID: ...{shortId}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          Submitted on: {new Date(currentItem.created_at).toLocaleDateString()}
        </span>
        <Badge variant="outline" className="text-[10px] capitalize">
          {rules.label}
        </Badge>
      </div>

      {/* Primary Linguistic Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Devanagari Root Script
          </label>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight select-all">
            {currentItem.word_devanagari}
          </h2>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Part of Speech
          </label>
          <p className="font-bold text-foreground/90">
            {currentItem.part_of_speech_name || "General"}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Latin Text
          </label>
          <p className="text-xl font-medium tracking-wide text-muted-foreground italic select-all">
            {currentItem.word_latin || "-"}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Word in Takri
          </label>
          <p className="text-xl font-medium text-muted-foreground select-all">
            {currentItem.word_takri || "-"}
          </p>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            International Phonetic Alphabet (IPA)
          </label>
          <span className="inline-flex items-center font-mono text-xs tracking-wide text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/5 dark:bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 select-all">
            /{currentItem.ipa || "Not Documented"}/
          </span>
        </div>
      </div>

      {/* Meanings */}
      <div className="space-y-4 border-b border-border/40 pb-6">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Detailed Dialect Meaning
          </label>
          <div className="bg-muted/40 dark:bg-muted/20 border border-border/40 p-4.5 rounded-xl text-foreground font-medium leading-relaxed shadow-inner">
            {currentItem.meaning}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 dark:bg-muted/10 p-4 rounded-xl border border-border/40">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Hindi Cross-Mapping Index
            </label>
            <p className="font-bold text-foreground/90">
              {currentItem.meaning_hindi || "-"}
            </p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              English Equivalent
            </label>
            <p className="font-bold text-foreground/90">
              {currentItem.meaning_english || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Usage Sentences */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Usage Validation Context Sentences
        </h4>
        <div className="relative overflow-hidden rounded-xl bg-indigo-500/2 p-4.5 border border-indigo-500/20 dark:border-indigo-500/10">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/60" />
          <div className="space-y-3.5 pl-1">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase block">
                Dialect Execution
              </span>
              <p className="text-base font-bold text-foreground select-all">
                &quot;{currentItem.example_sentence}&quot;
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5 border-t border-indigo-500/20 dark:border-indigo-500/10">
              <DisplayField
                label="Latinized Sentence"
                value={currentItem.example_sentence_latin}
              />
              <DisplayField
                label="Takri Sentence"
                value={currentItem.example_sentence_takri}
              />
              <DisplayField
                label="English Translation"
                value={currentItem.example_sentence_english}
              />
              <DisplayField
                label="Hindi Translation"
                value={currentItem.example_sentence_hindi}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Provenance Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <MetaBox
          icon={User}
          label="Contributor"
          value={currentItem.contributor_name}
        />
        <MetaBox
          icon={MapPin}
          label="Regional Zone"
          value={currentItem.region || "Statewide Standard"}
        />
        <MetaBox
          icon={Tag}
          label="Vocabulary Category"
          value={currentItem.category_name || "General Vocabulary"}
        />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Helper components (unchanged)
// ------------------------------------------------------------------
function DisplayField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
        {label}
      </label>
      <p className="font-bold text-foreground/90">{value || "-"}</p>
    </div>
  );
}

function MetaBox({ icon: Icon, label, value }: any) {
  return (
    <div className="border border-border/50 bg-card/40 dark:bg-card/20 p-2.5 rounded-lg flex items-center gap-2.5">
      <Icon className="size-3.5 text-muted-foreground/70 shrink-0" />
      <div className="min-w-0">
        <span className="text-[9px] font-medium text-muted-foreground block uppercase">
          {label}
        </span>
        <span className="text-xs font-bold text-foreground block truncate">
          {value}
        </span>
      </div>
    </div>
  );
}
