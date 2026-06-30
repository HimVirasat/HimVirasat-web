"use client";

import { CreateExpertDialog } from "@/components/admin/experts/create-expert-dialog";
import { ExpertTable } from "@/components/admin/experts/expert-table";
import { ExpertsToolbar } from "@/components/admin/experts/experts-header-toolbar";
import { UserService } from "@/lib/services/admin/user-service";
import { LanguageExpert } from "@/types/admin/user";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export default function ExpertsPage() {
  const [open, setOpen] = useState(false);

  const {
    data: experts = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["experts"],
    queryFn: UserService.getLanguageExperts,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  async function handleRemove(expertId: string) {
    try {
      setDeletingId(expertId);

      const resp = await UserService.deleteLanguageExpert(expertId);
      if (resp.success) {
        toast.success("Language Expert Deleted");
      }
      await refetch();
    } catch (error) {
      toast.error(`Language Expert Deletion Failed: ${error}`);
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Language Experts</h1>

          <p className="text-muted-foreground">
            Manage language experts and dialect assignments.
          </p>
        </div>
      </div>

      <CreateExpertDialog open={open} onOpenChange={setOpen} />
      <ExpertsToolbar
        refreshing={isFetching}
        onRefresh={refetch}
        search={search}
        onSearchChange={setSearch}
      />

      <ExpertTable
        experts={experts}
        deletingId={deletingId}
        onRemove={handleRemove}
        globalFilter={search}
      />
    </div>
  );
}
