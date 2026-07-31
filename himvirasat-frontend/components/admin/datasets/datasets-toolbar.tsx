"use client";

import { Search, X, SlidersHorizontal, RotateCcw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContributionSourceEnum,
  type ContributionSource,
} from "@himvirasat/shared";

export interface OptionItem {
  id: number;
  label: string;
}

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

interface DatasetToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  queryParams: Record<string, any>;
  updateParams: (params: Record<string, any>) => void;
  dialects: OptionItem[];
  categories: OptionItem[];
  posList: OptionItem[];
  regions: OptionItem[];
  activeFilters: ActiveFilter[];
  handleResetAllFilters: () => void;
  isFetching: boolean;
  isPending: boolean;
}

export function DatasetToolbar({
  searchTerm,
  setSearchTerm,
  queryParams,
  updateParams,
  dialects,
  categories,
  posList,
  regions,
  activeFilters,
  handleResetAllFilters,
  isFetching,
  isPending,
}: DatasetToolbarProps) {
  const contributionSources = ContributionSourceEnum.options;

  return (
    <div className="flex shrink-0 flex-col gap-2.5 rounded-xl border border-border/70 bg-card p-3 shadow-xs">
      {/* Search & Sorting Controls */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Devanagari, Latin script, or English/Hindi definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 bg-background pl-9 pr-8 text-xs focus-visible:ring-1"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={queryParams.sort_by || "created_at"}
            onValueChange={(val) => updateParams({ sort_by: val, page: 1 })}
          >
            <SelectTrigger className="h-9 w-36 bg-background text-xs border-border/60">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Added</SelectItem>
              <SelectItem value="word_devanagari">Devanagari</SelectItem>
              <SelectItem value="word_latin">Latin Script</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateParams({
                sort_order: queryParams.sort_order === "asc" ? "desc" : "asc",
                page: 1,
              })
            }
            className="h-9 px-3 text-xs border-border/60 bg-background"
          >
            {queryParams.sort_order === "asc" ? "Ascending ↑" : "Descending ↓"}
          </Button>

          {(isFetching || isPending) && (
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/5 text-primary">
              <Loader2 className="size-4 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Select Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-2 text-xs">
        <div className="mr-1 flex items-center gap-1.5 font-medium text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          <span>Filters:</span>
        </div>

        {/* Dialect */}
        <Select
          value={
            queryParams.dialect_id ? String(queryParams.dialect_id) : "all"
          }
          onValueChange={(val) =>
            updateParams({
              dialect_id: val === "all" ? undefined : Number(val),
              page: 1,
            })
          }
        >
          <SelectTrigger className="h-8 w-32 bg-background text-xs border-border/60">
            <SelectValue placeholder="Dialect" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dialects</SelectItem>
            {dialects.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        <Select
          value={
            queryParams.category_id ? String(queryParams.category_id) : "all"
          }
          onValueChange={(val) =>
            updateParams({
              category_id: val === "all" ? undefined : Number(val),
              page: 1,
            })
          }
        >
          <SelectTrigger className="h-8 w-32 bg-background text-xs border-border/60">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Part of Speech */}
        <Select
          value={
            queryParams.part_of_speech_id
              ? String(queryParams.part_of_speech_id)
              : "all"
          }
          onValueChange={(val) =>
            updateParams({
              part_of_speech_id: val === "all" ? undefined : Number(val),
              page: 1,
            })
          }
        >
          <SelectTrigger className="h-8 w-36 bg-background text-xs border-border/60">
            <SelectValue placeholder="Part of Speech" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Parts of Speech</SelectItem>
            {posList.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Region */}
        <Select
          value={queryParams.region_id ? String(queryParams.region_id) : "all"}
          onValueChange={(val) =>
            updateParams({
              region_id: val === "all" ? undefined : Number(val),
              page: 1,
            })
          }
        >
          <SelectTrigger className="h-8 w-32 bg-background text-xs border-border/60">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Source */}
        <Select
          value={queryParams.contribution_source || "all"}
          onValueChange={(val) =>
            updateParams({
              contribution_source:
                val === "all" ? undefined : (val as ContributionSource),
              page: 1,
            })
          }
        >
          <SelectTrigger className="h-8 w-32 bg-background text-xs border-border/60">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {contributionSources.map((source) => (
              <SelectItem key={source} value={source} className="capitalize">
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Action */}
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAllFilters}
            className="ml-auto h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-2">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active:
          </span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1.5 bg-secondary/70 px-2 py-0.5 text-xs font-normal"
            >
              <span>{filter.label}</span>
              <button
                type="button"
                onClick={filter.onRemove}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
