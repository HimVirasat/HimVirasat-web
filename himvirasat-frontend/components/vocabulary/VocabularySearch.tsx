"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import searchVocabulary from "@/lib/vocabulary/search-vocabulary";
import { VocabularyEntry } from "@/types/vocabulary/vocabulary-types";
import { datasetFilesMap } from "@/lib/dialects/dialect-config";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const VocabularyCard = dynamic(
  () => import("@/components/vocabulary/VocabularyCard"),
  {
    loading: () => <Skeleton className="h-28 w-full rounded-md" />,
    ssr: false,
  }
);

export default function VocabularySearch({ dialect }: { dialect: string }) {
  const [data, setData] = useState<VocabularyEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const path = datasetFilesMap[dialect];
    if (!path) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(path)
      .then((r) => r.json())
      .then((json: VocabularyEntry[]) => {
        setData(Array.isArray(json) ? json : []);
      })
      .finally(() => setLoading(false));
  }, [dialect]);

  const results = useMemo(() => {
    return searchVocabulary(data, deferredQuery, { dialect });
  }, [data, deferredQuery, dialect]);

  return (
    <section className="w-full">
      <div className="relative max-w-2xl">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${dialect} vocabulary…`}
          className="border-border bg-background h-14 rounded-md pr-24 pl-4 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1/2 right-2 -translate-y-1/2"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <p className="text-body-sm text-muted-foreground mt-3 tabular-nums">
        {loading
          ? `Loading ${dialect} vocabulary…`
          : `${results.length} of ${data.length} entries`}
      </p>

      {/* Entries read as one continuous ruled table rather than a stack of
          floating cards — the hairlines carry the structure. */}
      <div className="border-border bg-border mt-8 grid gap-px border">
        {results.length > 0 ? (
          results.map((entry, idx) => (
            <VocabularyCard
              key={`${entry.word_native}-${idx}`}
              entry={entry}
              query={deferredQuery}
              onSearch={setQuery}
            />
          ))
        ) : !loading ? (
          <div className="ruled-cell px-6 py-16 text-center">
            <p className="text-body">No matches. Try a shorter fragment.</p>
            <p className="text-body-sm text-muted-foreground mt-2">
              Search is fuzzy: partial words and approximate spellings still
              match.
            </p>
          </div>
        ) : (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="ruled-cell">
              <div className="bg-muted h-28 animate-pulse" />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
