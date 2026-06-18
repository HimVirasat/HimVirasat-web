"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ExpertRow } from "./expert-row";

import type { LanguageExpert } from "@/types/admin/user";

interface ExpertTableProps {
  experts: LanguageExpert[];
  onRemove: (expertId: string) => void;
}

export function ExpertTable({ experts, onRemove }: ExpertTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>

            <TableHead>Username</TableHead>

            <TableHead>Email</TableHead>

            <TableHead>Dialects</TableHead>
            <TableHead>Points</TableHead>

            <TableHead>Status</TableHead>

            <TableHead>Created</TableHead>

            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {experts.map((expert) => (
            <ExpertRow key={expert.id} expert={expert} onRemove={onRemove} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
