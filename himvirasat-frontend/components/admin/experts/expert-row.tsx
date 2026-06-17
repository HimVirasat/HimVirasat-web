"use client";

import { TableCell, TableRow } from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import type { LanguageExpert } from "@/types/admin/user";

interface ExpertRowProps {
  expert: LanguageExpert;
  onRemove: (expertId: string) => void;
}

export function ExpertRow({ expert, onRemove }: ExpertRowProps) {
  return (
    <TableRow>
      <TableCell>{expert.full_name}</TableCell>

      <TableCell>{expert.username}</TableCell>

      <TableCell>{expert.email ?? "-"}</TableCell>

      <TableCell>
        {expert.dialects.length > 0 ? expert.dialects.join(", ") : "-"}
      </TableCell>
      <TableCell>{String(expert.points)}</TableCell>
      <TableCell>
        <Badge variant={expert.is_active ? "default" : "secondary"}>
          {expert.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>

      <TableCell>{new Date(expert.created_at).toLocaleDateString()}</TableCell>

      <TableCell>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(expert.id)}
        >
          Remove
        </Button>
      </TableCell>
    </TableRow>
  );
}
