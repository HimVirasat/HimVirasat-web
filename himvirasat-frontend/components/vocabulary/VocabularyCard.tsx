"use client";

import { memo } from "react";
import { toast } from "sonner";

import { Eyebrow } from "@/components/mistral/eyebrow";
import { Button } from "@/components/ui/button";
import { cleanText } from "@/lib/vocabulary/search-vocabulary";
import type { VocabularyEntry } from "@/types/vocabulary/vocabulary-types";

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
            className="bg-pine-100 rounded-none px-0.5 text-[#07070b]"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
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
  const handleCopy = () => {
    navigator.clipboard.writeText(entry.word_native);
    toast("Copied");
  };

  return (
    <article className="ruled-cell min-w-0 p-6 lg:p-8">
      <h2 className="font-deva text-3xl leading-snug break-words" lang="hi">
        {highlightText(entry.word_native, query)}
      </h2>
      <Eyebrow className="mt-2 break-words">
        {highlightText(entry.word_meaning_en, query)}
      </Eyebrow>

      <div className="border-hairline-strong mt-5 border-l pl-5">
        <p className="font-deva text-body break-words" lang="hi">
          {highlightText(entry.sentence_native, query)}
        </p>
        <p className="text-body-sm text-muted-foreground mt-1 break-words">
          {highlightText(entry.sentence_meaning_en, query)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {entry.region && (
          <span className="animate-pop-in border-border text-body-sm text-muted-foreground rounded-md border px-2.5 py-0.5">
            {entry.region}
          </span>
        )}
        {entry.contributor_username && (
          <span className="animate-pop-in border-border text-body-sm text-muted-foreground rounded-md border px-2.5 py-0.5">
            {entry.contributor_username}
          </span>
        )}

        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearch(cleanText(entry.word_native))}
          >
            Find similar
          </Button>
        </div>
      </div>
    </article>
  );
});
