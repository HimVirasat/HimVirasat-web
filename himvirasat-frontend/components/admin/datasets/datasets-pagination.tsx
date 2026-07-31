"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatasetPaginationProps {
  currentCount: number;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  queryParams: Record<string, any>;
  updateParams: (params: Record<string, any>) => void;
  isFetching: boolean;
}

export function DatasetPagination({
  currentCount,
  pagination,
  queryParams,
  updateParams,
  isFetching,
}: DatasetPaginationProps) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-2.5 text-xs text-muted-foreground shadow-xs sm:flex-row">
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-foreground">{currentCount}</strong> of{" "}
          <strong className="text-foreground">{pagination.total}</strong> results
        </span>
        <span className="hidden h-3 w-px bg-border/60 sm:block" />
        <span>
          Page <strong className="text-foreground">{pagination.page}</strong> of{" "}
          <strong className="text-foreground">{pagination.totalPages}</strong>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={String(queryParams.limit || 20)}
          onValueChange={(val) => updateParams({ limit: Number(val), page: 1 })}
        >
          <SelectTrigger className="h-8 w-20 bg-background text-xs border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1 || isFetching}
            onClick={() => updateParams({ page: pagination.page - 1 })}
            className="size-8 p-0 border-border/60 bg-background"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages || isFetching}
            onClick={() => updateParams({ page: pagination.page + 1 })}
            className="size-8 p-0 border-border/60 bg-background"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}