"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Edit2, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DataLookupService } from "@/lib/services/admin/datalookup-service";
import { UserService } from "@/lib/services/admin/user-service";

interface EditableDialectsCellProps {
  userId: string;
  currentDialects: string[];
  type: "expert" | "head";
}

export function EditableDialectsCell({
  userId,
  currentDialects,
  type,
}: EditableDialectsCellProps) {
  const [open, setOpen] = useState(false);
  const [dialects, setDialects] = useState<string[]>(currentDialects || []);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const { data: dbDialects = [], isLoading: isLoadingLookups } = useQuery({
    queryKey: ["datalookup", "dialects"],
    queryFn: DataLookupService.getAvailableDialects,
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  const handleToggle = (dialect: string) => {
    setDialects((prev) =>
      prev.includes(dialect)
        ? prev.filter((d) => d !== dialect)
        : [...prev, dialect]
    );
  };

  const handleSave = async () => {
    if (dialects.length === 0) {
      toast.error("At least one dialect must be selected.");
      return;
    }

    setIsUpdating(true);
    try {
      const res =
        type === "expert"
          ? await UserService.updateExpertDialects(userId, dialects)
          : await UserService.updateHeadDialects(userId, dialects);

      if (res.success) {
        toast.success("Dialects updated successfully!");
        queryClient.invalidateQueries({
          queryKey: [type === "expert" ? "experts" : "language-heads"],
        });
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to update dialects.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during update.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="group flex items-center gap-1.5 cursor-pointer py-1">
          <div className="flex flex-wrap gap-1 max-w-70">
            {currentDialects && currentDialects.length > 0 ? (
              currentDialects.map((d) => (
                <Badge
                  key={d}
                  variant="outline"
                  className="bg-muted/30 text-[10px] font-medium border-border/60 group-hover:border-primary/45"
                >
                  {d}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <Edit2 className="size-3 text-muted-foreground" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-3" align="start">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Modify Dialects
          </span>
          <span className="text-[10px] text-muted-foreground">
            {dialects.length} selected
          </span>
        </div>

        {isLoadingLookups ? (
          <div className="h-24 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-md bg-muted/20">
            <Loader2 className="size-4 animate-spin mr-1.5" /> Loading
            dialects...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto border p-1.5 rounded-md bg-background/50">
            {dbDialects.map((dialect) => {
              const isChecked = dialects.includes(dialect);
              return (
                <button
                  key={dialect}
                  type="button"
                  onClick={() => handleToggle(dialect)}
                  className={`flex items-center justify-between px-2 py-1 text-[11px] font-medium rounded border transition-all cursor-pointer ${
                    isChecked
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "hover:bg-muted/40 text-muted-foreground border-transparent"
                  }`}
                >
                  <span className="truncate">{dialect}</span>
                  {isChecked && (
                    <Check className="size-3 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setDialects(currentDialects || []);
              setOpen(false);
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleSave}
            disabled={isUpdating || isLoadingLookups}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
