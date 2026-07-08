"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { primaryButtonStyles } from "@/lib/constants";
import { UserService } from "@/lib/services/admin/user-service";
import { DataLookupService } from "@/lib/services/admin/datalookup-service";

interface CreateExpertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateExpertDialog({
  open,
  onOpenChange,
}: CreateExpertDialogProps) {
  const [selectedDialects, setSelectedDialects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: dbDialects = [],
    isLoading: isLoadingDialects,
    isError: isErrorDialects,
  } = useQuery({
    queryKey: ["datalookup", "dialects"],
    queryFn: DataLookupService.getAvailableDialects,
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  React.useEffect(() => {
    if (isErrorDialects && open) {
      toast.error(
        "Failed to load active dialects configuration lookup values."
      );
    }
  }, [isErrorDialects, open]);

  const handleToggleDialect = (dialect: string) => {
    setSelectedDialects((prev) =>
      prev.includes(dialect)
        ? prev.filter((d) => d !== dialect)
        : [...prev, dialect]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (selectedDialects.length === 0) {
      toast.error("Please assign at least one target configuration dialect.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName")?.toString().trim() ?? "";
    const email = formData.get("email")?.toString().trim() ?? "";
    const username = formData.get("username")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    try {
      const ret = await UserService.createLanguageExpert({
        fullName,
        email,
        username,
        password,
        dialects: selectedDialects,
      });

      if (ret.success) {
        toast.success(`Language Expert ${fullName} created successfully.`, {
          duration: 5000,
        });
        setSelectedDialects([]);
        onOpenChange(false);
      } else {
        toast.error(
          ret.message || "Failed to finalize workflow entity registration."
        );
      }
    } catch (error) {
      toast.error(`Unable to create Language Expert: ${error}`, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) setSelectedDialects([]);
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Expert</DialogTitle>
          <DialogDescription>
            Create a new language expert and assign supported dialects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="john@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="johndoe"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Clean Orchestration Section for Dialect Selection */}
          <div className="space-y-2">
            <Label>Assign Supported Dialects</Label>
            {isLoadingDialects
              ? renderLoadingState()
              : isErrorDialects
                ? renderErrorState()
                : renderDialectSelection(
                    dbDialects,
                    selectedDialects,
                    handleToggleDialect
                  )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || isLoadingDialects || isErrorDialects}
              className={"rounded-b-none " + primaryButtonStyles}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function renderLoadingState() {
  return (
    <div className="h-10 text-xs flex items-center justify-center border border-dashed rounded-md bg-muted/20 animate-pulse text-muted-foreground">
      Loading options from data matrix repository...
    </div>
  );
}

function renderErrorState() {
  return (
    <div className="p-3 text-xs border rounded-md border-red-200 bg-red-500/5 text-red-500 text-center">
      Could not retrieve runtime lookups. Fill out fields later.
    </div>
  );
}

function renderDialectSelection(
  dbDialects: string[],
  selectedDialects: string[],
  onToggle: (dialect: string) => void
) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5 min-h-8 p-1.5 border rounded-md bg-muted/10">
        {selectedDialects.length === 0 ? (
          <span className="text-xs text-muted-foreground self-center px-1">
            No dialects specified. Tap items below to match.
          </span>
        ) : (
          selectedDialects.map((dialect) => (
            <Badge
              key={dialect}
              variant="secondary"
              className="gap-1 pl-2 pr-1 h-5.5 text-[11px] font-medium"
            >
              {dialect}
              <button
                type="button"
                onClick={() => onToggle(dialect)}
                className="rounded-full hover:bg-background/80 p-0.5 group cursor-pointer"
              >
                <X className="size-2.5 text-muted-foreground group-hover:text-foreground" />
              </button>
            </Badge>
          ))
        )}
      </div>
      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto border p-2 rounded-md bg-background/50">
        {dbDialects.map((dialect) => {
          const isChecked = selectedDialects.includes(dialect);
          return (
            <button
              key={dialect}
              type="button"
              onClick={() => onToggle(dialect)}
              className={`flex items-center justify-between text-left px-2.5 py-1.5 text-xs font-medium rounded border transition-all cursor-pointer ${
                isChecked
                  ? "bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400"
                  : "hover:bg-muted/40 text-muted-foreground border-transparent"
              }`}
            >
              <span>{dialect}</span>
              {isChecked && (
                <Check className="size-3 shrink-0 text-green-600 dark:text-green-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
