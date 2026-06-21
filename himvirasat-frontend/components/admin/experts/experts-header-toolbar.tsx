"use client";

import { Download, Filter, Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { primaryButtonStyles } from "@/lib/constants";
import { CreateExpertDialog } from "./create-expert-dialog";
import { useState } from "react";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
interface ExpertsToolbarProps {
  loading: boolean;
  onRefresh: any;
}

export function ExpertsToolbar({
  loading,
  onRefresh,
}: ExpertsToolbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-start">
      <ButtonGroup aria-label="Expert actions">

        <Button
          variant="outline"
          onClick={() => onRefresh()}
          disabled={loading}
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              loading && "animate-spin"
            )}
          />

          {loading ? "Refreshing..." : "Refresh"}
        </Button>
        <ButtonGroupSeparator />
        <Button
          variant="outline"

          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Expert
        </Button>
        <CreateExpertDialog
          open={open}
          onOpenChange={setOpen}
        />
      </ButtonGroup>
    </div>
  );
}