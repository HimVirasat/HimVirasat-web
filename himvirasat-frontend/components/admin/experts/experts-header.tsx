"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { primaryButtonStyles } from "@/lib/constants";

import { Plus } from "lucide-react";

import { CreateExpertDialog } from "./create-expert-dialog";

export function ExpertsHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Language Experts
          </h1>

          <p className="text-muted-foreground">
            Manage language experts and dialect assignments.
          </p>
        </div>

        <Button
          className={primaryButtonStyles}
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Expert
        </Button>
      </div>

      <CreateExpertDialog
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}