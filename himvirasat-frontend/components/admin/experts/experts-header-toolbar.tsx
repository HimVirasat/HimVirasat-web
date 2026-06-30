"use client";

import { Plus, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";

import { cn } from "@/lib/utils";
import { CreateExpertDialog } from "./create-expert-dialog";
import { useState } from "react";

interface ExpertsToolbarProps {
  refreshing: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}
export function ExpertsToolbar({
  refreshing,
  search,
  onSearchChange,
  onRefresh,
}: ExpertsToolbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <ButtonGroup aria-label="Expert actions">
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          {refreshing ? "Refresh" : "Refresh"}
        </Button>

        <ButtonGroupSeparator />

        <Button variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Expert
        </Button>

        <CreateExpertDialog open={open} onOpenChange={setOpen} />
      </ButtonGroup>

      <div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-md border bg-card px-3 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search experts..."
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
