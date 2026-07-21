"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ShieldCheck } from "lucide-react";
import type { LanguageHead } from "@/types/admin/user";
import { EditableDialectsCell } from "../data-table/editable-dialects-cell";

export function getHeadColumns(
  onRemove: (headId: string) => void,
  deletingId: string | null
): ColumnDef<LanguageHead>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Language Head",
      cell: ({ row }) => {
        const item = row.original;
        const initials = item.full_name
          ? item.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "LH";

        return (
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                {item.full_name}
                <ShieldCheck className="size-3.5 text-indigo-500" />
              </span>
              <span className="text-xs text-muted-foreground">
                @{item.username}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "dialects",
      header: "Managed Dialects",
      cell: ({ row }) => (
        <EditableDialectsCell
          userId={row.original.id}
          currentDialects={row.original.dialects}
          type="head"
        />
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.is_active ?? true;
        return (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={
              isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                : "bg-muted text-muted-foreground"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) =>
        row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "-",
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        const isAlreadyDeleted =
          item.is_active === false || item.username?.startsWith("deleted_");

        const isDeleting = deletingId === item.id;
        const isDisabled = isDeleting || isAlreadyDeleted;

        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer disabled:opacity-50"
            disabled={isDisabled}
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="mr-1.5 size-3.5" />
            {isAlreadyDeleted
              ? "Deleted"
              : isDeleting
                ? "Removing..."
                : "Remove"}
          </Button>
        );
      },
    },
  ];
}
