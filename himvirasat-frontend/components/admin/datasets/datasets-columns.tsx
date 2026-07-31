"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DatasetEntry as BaseDatasetEntry } from "@himvirasat/shared";
import { Badge } from "@/components/ui/badge";
import {
  Disc,
  MessageSquare,
  UserX,
  Languages,
  User,
  Tag,
  MapPin,
} from "lucide-react";

export interface DatasetEntry extends BaseDatasetEntry {
  contributor_name?: string | null;
  dialect_name?: string | null;
  category_name?: string | null;
  pos_name?: string | null;
  region_name?: string | null;
}

export function getDatasetColumns(): ColumnDef<DatasetEntry>[] {
  return [
    {
      accessorKey: "word_devanagari",
      header: "Devanagari",
      cell: ({ row }) => (
        <div className="flex flex-col py-0.5">
          <span className="font-semibold text-sm text-foreground tracking-tight">
            {row.original.word_devanagari}
          </span>
          {row.original.word_ipa && (
            <span className="font-mono text-[11px] text-muted-foreground/80">
              [{row.original.word_ipa}]
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "dialect_name",
      header: "Dialect",
      cell: ({ row }) => {
        const name = row.original.dialect_name;
        return (
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Languages className="size-3.5 text-muted-foreground shrink-0" />
            <span>{name || `Dialect #${row.original.dialect_id}`}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "word_latin",
      header: "Latin / Romanized",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-foreground/90 font-medium">
          {row.original.word_latin || "—"}
        </span>
      ),
    },
    {
      accessorKey: "word_takri",
      header: "Takri Script",
      cell: ({ row }) => (
        <span className="text-xs text-foreground/80 font-medium">
          {row.original.word_takri || "—"}
        </span>
      ),
    },
    {
      accessorKey: "meaning_english",
      header: "English Meaning",
      cell: ({ row }) => (
        <span className="text-xs text-foreground/90 line-clamp-1 max-w-50">
          {row.original.meaning_english || "—"}
        </span>
      ),
    },
    {
      accessorKey: "meaning_hindi",
      header: "Hindi Meaning",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-45">
          {row.original.meaning_hindi || "—"}
        </span>
      ),
    },
    {
      accessorKey: "category_name",
      header: "Category & POS",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1">
          {row.original.category_name && (
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1.5 font-normal border-border/80"
            >
              <Tag className="mr-1 size-2.5 text-muted-foreground" />
              {row.original.category_name}
            </Badge>
          )}
          {row.original.pos_name && (
            <Badge
              variant="secondary"
              className="text-[10px] py-0 px-1.5 font-normal bg-secondary/60"
            >
              {row.original.pos_name}
            </Badge>
          )}
          {!row.original.category_name && !row.original.pos_name && (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "contribution_source",
      header: "Source & Contributor",
      cell: ({ row }) => {
        const source = row.original.contribution_source;
        const contributor = row.original.contributor_name;

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              {!source || source === "anonymous" ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-border/60 text-muted-foreground font-normal text-[11px] py-0"
                >
                  <UserX className="size-3" /> Anonymous
                </Badge>
              ) : source === "discord" ? (
                <Badge className="gap-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium text-[11px] py-0 shadow-none">
                  <Disc className="size-3" /> Discord
                </Badge>
              ) : source === "reddit" ? (
                <Badge className="gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-medium text-[11px] py-0 shadow-none">
                  <MessageSquare className="size-3" /> Reddit
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[11px] py-0">
                  {source}
                </Badge>
              )}
            </div>

            {contributor && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <User className="size-2.5 shrink-0" />
                <span className="truncate max-w-30">{contributor}</span>
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Added On",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.original.created_at
            ? new Date(row.original.created_at).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
  ];
}
