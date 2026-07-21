"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table/data-table";
import { getHeadColumns } from "@/components/admin/heads/head-column";
import { HeadsToolbar } from "@/components/admin/heads/heads-header-toolbar";
import { UserService } from "@/lib/services/admin/user-service";

export default function LanguageHeadsPage() {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: heads = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["language-heads"],
    queryFn: UserService.getLanguageHeads,
  });

  async function handleRemove(headId: string) {
    try {
      setDeletingId(headId);
      const resp = await UserService.deleteLanguageHead(headId);
      if (resp.success) {
        toast.success("Language Head removed successfully");
      }
      await refetch();
    } catch (error: any) {
      toast.error(`Deletion failed: ${error.message || error}`);
    } finally {
      setDeletingId(null);
    }
  }

  const columns = getHeadColumns(handleRemove, deletingId);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Language Heads</h1>
          <p className="text-muted-foreground text-sm">
            Manage regional administrators overseeing dialect accuracy and validations.
          </p>
        </div>
      </div>

      <HeadsToolbar
        refreshing={isFetching}
        onRefresh={refetch}
        search={search}
        onSearchChange={setSearch}
      />

      <DataTable columns={columns} data={heads} globalFilter={search} />
    </div>
  );
}