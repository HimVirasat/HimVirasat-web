"use client";

import { DataTable } from "@/components/admin/data-table/data-table";
import { getExpertColumns } from "./expert-columns";
import type { LanguageExpert } from "@/types/admin/user";

interface ExpertTableProps {
  experts: LanguageExpert[];
  deletingId: string | null;
  globalFilter: string;
  onRemove: (expertId: string) => void;
}

export function ExpertTable({
  experts,
  deletingId,
  globalFilter,
  onRemove,
}: ExpertTableProps) {
  const columns = getExpertColumns(onRemove, deletingId);

  return (
    <DataTable columns={columns} data={experts} globalFilter={globalFilter} />
  );
}
