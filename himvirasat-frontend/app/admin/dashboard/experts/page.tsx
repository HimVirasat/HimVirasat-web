"use client";

import { useEffect, useState } from "react";

import { ExpertTable } from "@/components/admin/experts/expert-table";

import { UserService } from "@/lib/services/admin/user-service";

import type { LanguageExpert } from "@/types/admin/user";
import { ExpertsToolbar } from "@/components/admin/experts/experts-toolbar";
import { ExpertsHeader } from "@/components/admin/experts/experts-header";

export default function ExpertsPage() {
  const [experts, setExperts] = useState<LanguageExpert[]>([]);

  useEffect(() => {
    async function loadExperts() {
      const data = await UserService.getLanguageExperts();

      setExperts(data);
    }

    loadExperts();
  }, []);

  async function handleRemove(expertId: string) {
    console.log("Remove", expertId);
    setExperts((prev) => prev.filter((expert) => expert.id !== expertId));
  }

  return (
    <div className="space-y-6 p-6">
      <ExpertsHeader />
      <ExpertsToolbar />

      <ExpertTable experts={experts} onRemove={handleRemove} />
    </div>
  );
}
