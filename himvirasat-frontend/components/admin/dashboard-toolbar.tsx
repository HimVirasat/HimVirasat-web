"use client";

import { Plus, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";

import { cn } from "@/lib/utils";
// import { CreateExpertDialog } from "./create-expert-dialog";
import { useState } from "react";

interface DashboardToolbarProps {
  refreshing: boolean;
  onRefresh: () => void;
}
export function DashboardToolbar({
  refreshing,
  //   search,
  //   onSearchChange,
  onRefresh,
}: DashboardToolbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <ButtonGroup aria-label="Expert actions">
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          {refreshing ? "Refresh" : "Refresh"}
        </Button>
      </ButtonGroup>
    </div>
  );
}
