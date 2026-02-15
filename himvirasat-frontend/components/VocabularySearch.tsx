"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useDeferredValue } from "react";
import searchVocabulary from "@/lib/search-vocabulary";
import { VocabularyEntry } from "@/types/vocabulary-types";
import { datasetFilesMap } from "@/lib/dialect-utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const VocabularyCard = dynamic(() => import("@/components/VocabularyCard"), {
  loading: () => <Skeleton className="h-28 w-full rounded-xl" />,
  ssr: false,
});

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
    <section className="w-full space-y-6">
      <div className="flex gap-3 max-w-2xl">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${dialect} vocabulary…`}
          className="h-14 text-base bg-white/5 border-white/10 text-white placeholder:text-slate-300 focus:ring-emerald-500 rounded-xl"
        />

        <Button
          variant="outline"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="h-14 px-6 bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 rounded-xl"
        >
          Clear
        </Button>
      </div>

      <div className="text-sm text-slate-300">
        {loading
          ? `Loading ${dialect} heritage...`
          : query.trim()
            ? `Found ${results.length} matches`
            : `Showing all ${data.length} entries`}
      </div>

      <ScrollArea className="h-[60vh] w-full pr-4">
        <div className="space-y-4 pb-10">
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
            <div className="text-center py-20 text-slate-300">
              No matches found for "{query}"
            </div>
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 bg-white/5 animate-pulse rounded-xl"
              />
            ))
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
