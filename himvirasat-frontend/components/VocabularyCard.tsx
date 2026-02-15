"use client";

import type { VocabularyEntry } from "@/types/vocabulary-types";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Search, MapPin, User } from "lucide-react";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query: string) {
  if (!query) return <>{text}</>;
  const q = query.trim();
  if (!q) return <>{text}</>;

  const regex = new RegExp(`(${escapeRegExp(q)})`, "ig");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-amber-200/60 rounded px-0.5 dark:bg-gray-400"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default memo(function VocabularyCard({
  entry,
  query,
  onSearch,
}: {
  entry: VocabularyEntry;
  query: string;
  onSearch: (word: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.word_native);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="border border-border rounded-xl bg-card text-card-foreground p-6 space-y-4 hover:bg-muted/95 transition-colors duration-200">
      <div>
        <h2 className="text-3xl font-semibold leading-snug wrap-break-word">
          {highlightText(entry.word_native, query)}
        </h2>

        <p className="text-lg mt-1 wrap-break-word text-green-500 font-semibold">
          {highlightText(entry.word_meaning_en, query)}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-base leading-relaxed wrap-break-word">
          {highlightText(entry.sentence_native, query)}
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed wrap-break-word">
          {highlightText(entry.sentence_meaning_en, query)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {entry.region || "Region not specified"}
        </span>

        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {entry.contributor_username || "Anonymous"}
        </span>
      </div>
      <div className="flex gap-3 pt-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5 mr-1" />
              {copied ? "Copied" : "Copy"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied!" : "Copy word"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSearch(entry.word_native)}
            >
              <Search className="h-3.5 w-3.5 mr-1" />
              Search
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search this word</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});
