"use client";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Search, Download } from "lucide-react";

export function ExpertsToolbar() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative max-w-sm"></div>

      <div className="flex gap-2">
        <Button variant="outline">Export</Button>

        <Button variant="outline">Filters</Button>
      </div>
    </div>
  );
}
