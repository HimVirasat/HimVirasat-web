"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { FetchDatasetsQueryParams } from "@himvirasat/shared";

/**
 * Safely converts a URL param string to a positive integer or undefined.
 * Strictly prevents NaN, "NaN", "undefined", "null", or negative/zero numbers.
 */
function parseSafeIntParam(val: string | null): number | undefined {
  if (!val || val === "NaN" || val === "undefined" || val === "null" || val === "all") {
    return undefined;
  }
  const parsed = Number(val);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }
  return Math.floor(parsed);
}

export function useDatasetParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Extract current values safely from URL (Guarantees NO NaN ever enters state)
  const queryParams: FetchDatasetsQueryParams = {
    page: parseSafeIntParam(searchParams.get("page")) || 1,
    limit: parseSafeIntParam(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || undefined,
    language_id: parseSafeIntParam(searchParams.get("language_id")),
    dialect_id: parseSafeIntParam(searchParams.get("dialect_id")),
    region_id: parseSafeIntParam(searchParams.get("region_id")),
    category_id: parseSafeIntParam(searchParams.get("category_id")),
    part_of_speech_id: parseSafeIntParam(searchParams.get("part_of_speech_id")),
    contribution_source: (searchParams.get("contribution_source") as any) || undefined,
    sort_by: (searchParams.get("sort_by") as any) || "created_at",
    sort_order: (searchParams.get("sort_order") as any) || "desc",
  };

  const updateParams = useCallback(
    (newParams: Partial<FetchDatasetsQueryParams>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        // Delete parameter if value is undefined, null, empty, "all", or NaN
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          value === "all" ||
          (typeof value === "number" && Number.isNaN(value)) ||
          String(value) === "NaN" ||
          String(value) === "undefined"
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Reset to page 1 whenever any filter changes (unless explicit page provided)
      if (newParams.page === undefined) {
        params.set("page", "1");
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  return { queryParams, updateParams, isPending };
}