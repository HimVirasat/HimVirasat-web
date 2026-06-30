"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { LanguageExpert } from "@/types/admin/user";

export function getExpertColumns(
  onRemove: (expertId: string) => void,
  deletingId: string | null
): ColumnDef<LanguageExpert>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Full Name",
    },

    {
      accessorKey: "username",
      header: "Username",
    },

    {
      accessorKey: "email",
      header: "Email",
    },

    {
      accessorKey: "dialects",
      header: "Dialects",

      cell: ({ row }) =>
        row.original.dialects.length > 0
          ? row.original.dialects.join(", ")
          : "-",
    },

    {
      accessorKey: "points",
      header: "Points",
    },

    {
      accessorKey: "is_active",
      header: "Status",

      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },

    {
      accessorKey: "created_at",
      header: "Created",

      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,

      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="sm"
          disabled={deletingId === row.original.id}
          onClick={() => onRemove(row.original.id)}
        >
          {deletingId === row.original.id ? "Removing..." : "Remove"}
        </Button>
      ),
    },
  ];
}
