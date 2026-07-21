"use client";

import { Plus, RefreshCw, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { CreateHeadDialog } from "./create-head-dialog";

interface HeadsToolbarProps {
  refreshing: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export function HeadsToolbar({
  refreshing,
  search,
  onSearchChange,
  onRefresh,
}: HeadsToolbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <ButtonGroup aria-label="Head management actions">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          className="transition-colors hover:bg-muted/60"
        >
          <RefreshCw
            className={cn(
              "mr-2 size-3.5 shrink-0 transition-transform",
              refreshing && "animate-spin text-primary"
            )}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </Button>

        <ButtonGroupSeparator />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="transition-colors hover:bg-muted/60"
        >
          <Plus className="mr-2 size-3.5 shrink-0 text-muted-foreground" />
          <span>Create Head</span>
        </Button>

        <CreateHeadDialog open={open} onOpenChange={setOpen} />
      </ButtonGroup>

      <div className="flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-border/60 bg-card px-3 shadow-xs transition-colors focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20">
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search language heads..."
          className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}