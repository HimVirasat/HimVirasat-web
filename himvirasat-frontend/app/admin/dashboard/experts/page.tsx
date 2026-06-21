"use client";

import { CreateExpertDialog } from "@/components/admin/experts/create-expert-dialog";
import { ExpertTable } from "@/components/admin/experts/expert-table";
import { ExpertsToolbar } from "@/components/admin/experts/experts-header-toolbar";
import { UserService } from "@/lib/services/admin/user-service";
import { LanguageExpert } from "@/types/admin/user";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";

export default function ExpertsPage() {
  // const [experts, setExperts] = useState<LanguageExpert[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    data: experts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["experts"],
    queryFn: UserService.getLanguageExperts,
  });

  async function handleRemove(expertId: string) {
    // todo later
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Language Experts
          </h1>

          <p className="text-muted-foreground">
            Manage language experts and dialect assignments.
          </p>
        </div>

      </div>

      <CreateExpertDialog
        open={open}
        onOpenChange={setOpen}
      />
      <ExpertsToolbar
        loading={loading}
        onRefresh={refetch}
      />

      <ExpertTable
        experts={experts}
        onRemove={handleRemove}
      />
    </div>
  );
}