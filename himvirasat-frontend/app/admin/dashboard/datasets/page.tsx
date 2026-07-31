import { Suspense } from "react";
import { DatasetExplorer } from "@/components/admin/datasets/datasets-explorer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Datasets | Admin Dashboard",
  description: "Explore and filter Pahadi dialect dataset entries.",
};

export default function DatasetsPage() {
  return (
    <div className="h-full w-full p-4 md:p-6">
      <Suspense fallback={<DatasetSkeleton />}>
        <DatasetExplorer />
      </Suspense>
    </div>
  );
}

function DatasetSkeleton() {
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-3">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="flex-1 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}