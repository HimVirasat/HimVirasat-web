"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Check, UserPlus } from "lucide-react";

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
  const queryClient = useQueryClient();

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
      toast.error("Please assign at least one target dialect.");
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
        toast.success(`Language Expert ${fullName} created successfully.`);
        setSelectedDialects([]);
        queryClient.invalidateQueries({ queryKey: ["experts"] });
        onOpenChange(false);
      } else {
        toast.error(ret.message || "Failed to create Language Expert.");
      }
    } catch (error: any) {
      toast.error(error.message || "Unable to create Language Expert.");
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
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-emerald-500" />
            Create Language Expert
          </DialogTitle>
          <DialogDescription>
            Create a new language expert and assign supported dialects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="john@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
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
          </div>

          <div className="space-y-2 pt-2">
            <Label>Supported Dialects</Label>
            {isLoadingDialects ? (
              <div className="h-10 text-xs flex items-center justify-center border border-dashed rounded-md bg-muted/20 animate-pulse text-muted-foreground">
                Loading options...
              </div>
            ) : isErrorDialects ? (
              <div className="p-3 text-xs border rounded-md border-red-200 bg-red-500/5 text-red-500 text-center">
                Could not retrieve lookups.
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex flex-wrap gap-1.5 min-h-8 p-1.5 border rounded-md bg-muted/10">
                  {selectedDialects.length === 0 ? (
                    <span className="text-xs text-muted-foreground self-center px-1">
                      No dialects specified. Tap items below.
                    </span>
                  ) : (
                    selectedDialects.map((dialect) => (
                      <Badge
                        key={dialect}
                        variant="secondary"
                        className="gap-1 pl-2 pr-1 text-[11px]"
                      >
                        {dialect}
                        <button
                          type="button"
                          onClick={() => handleToggleDialect(dialect)}
                          className="rounded-full hover:bg-background p-0.5 cursor-pointer"
                        >
                          <X className="size-2.5 text-muted-foreground" />
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
                        onClick={() => handleToggleDialect(dialect)}
                        className={`flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded border transition-all cursor-pointer ${
                          isChecked
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                            : "hover:bg-muted/40 text-muted-foreground border-transparent"
                        }`}
                      >
                        <span>{dialect}</span>
                        {isChecked && (
                          <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3">
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
              disabled={isSubmitting || isLoadingDialects}
              className={primaryButtonStyles}
            >
              {isSubmitting ? "Creating..." : "Create Expert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
