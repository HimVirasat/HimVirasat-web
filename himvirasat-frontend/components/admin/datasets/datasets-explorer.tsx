"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/admin/data-table/data-table";
import { getDatasetColumns, type DatasetEntry } from "./datasets-columns";
import { DatasetToolbar, OptionItem, ActiveFilter } from "./datasets-toolbar";
import { DatasetPagination } from "./datasets-pagination";
import { useDatasetParams } from "@/hooks/use-datasets-params";
import { DataLookupService } from "@/lib/services/admin/datalookup-service";
import { useQuery } from "@tanstack/react-query";
import { Database, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/lib/constants";

interface DatasetApiResponse {
  success: boolean;
  data: DatasetEntry[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}

function normalizeToNumericOptions(rawInput: any): OptionItem[] {
  if (!rawInput) return [];

  const rawList = Array.isArray(rawInput)
    ? rawInput
    : Array.isArray(rawInput?.data)
      ? rawInput.data
      : [];

  if (rawList.length === 0) return [];

  return rawList
    .map((item: any, index: any) => {
      if (!item && item !== 0) return null;

      if (typeof item !== "object") {
        const parsedNum = Number(item);
        if (!Number.isNaN(parsedNum) && parsedNum > 0) {
          return { id: parsedNum, label: String(item) };
        }
        return { id: index + 1, label: String(item) };
      }

      const rawId =
        item.id ??
        item.dialect_id ??
        item.category_id ??
        item.part_of_speech_id ??
        item.pos_id ??
        item.region_id ??
        item.value;

      const label =
        item.name ??
        item.dialect_name ??
        item.category_name ??
        item.pos_name ??
        item.region_name ??
        item.label ??
        (rawId !== undefined && rawId !== null
          ? String(rawId)
          : `Option ${index + 1}`);

      const numericId = Number(rawId);

      if (rawId === undefined || rawId === null || Number.isNaN(numericId)) {
        return { id: index + 1, label: String(label) };
      }

      return {
        id: numericId,
        label: String(label),
      };
    })
    .filter(
      (opt: any): opt is OptionItem => opt !== null && !Number.isNaN(opt.id)
    );
}

export function DatasetExplorer() {
  const { queryParams, updateParams, isPending } = useDatasetParams();
  const [searchTerm, setSearchTerm] = useState(queryParams.search || "");

  // Lookups
  const { data: rawDialects } = useQuery({
    queryKey: ["lookup_dialects"],
    queryFn: () => DataLookupService.getAvailableDialects(),
    staleTime: Infinity,
  });

  const { data: rawCategories } = useQuery({
    queryKey: ["lookup_categories"],
    queryFn: () => DataLookupService.getAvailableCategories(),
    staleTime: Infinity,
  });

  const { data: rawPosList } = useQuery({
    queryKey: ["lookup_pos"],
    queryFn: () => DataLookupService.getAvailablePartsOfSpeech(),
    staleTime: Infinity,
  });

  const { data: rawRegions } = useQuery({
    queryKey: ["lookup_regions"],
    queryFn: () => DataLookupService.getAvailableRegions(),
    staleTime: Infinity,
  });

  const dialects = useMemo(
    () => normalizeToNumericOptions(rawDialects),
    [rawDialects]
  );
  const categories = useMemo(
    () => normalizeToNumericOptions(rawCategories),
    [rawCategories]
  );
  const posList = useMemo(
    () => normalizeToNumericOptions(rawPosList),
    [rawPosList]
  );
  const regions = useMemo(
    () => normalizeToNumericOptions(rawRegions),
    [rawRegions]
  );

  // Debounced Search Sync
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (queryParams.search || "")) {
        updateParams({
          search: searchTerm.trim() || undefined,
          page: 1,
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, queryParams.search, updateParams]);

  // Fetch Dataset Entries
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useQuery<DatasetApiResponse>({
    queryKey: ["dataset_entries", queryParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, val]) => {
        if (
          val !== undefined &&
          val !== null &&
          val !== "" &&
          val !== "all" &&
          val !== "NaN" &&
          !Number.isNaN(val)
        ) {
          params.append(key, String(val));
        }
      });

      const res = await fetch(`${API_URL}/datasets?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch dataset entries");
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  const columns = useMemo(() => getDatasetColumns(), []);
  const entries: DatasetEntry[] = useMemo(
    () => response?.data || [],
    [response]
  );
  const pagination = useMemo(
    () =>
      response?.pagination || {
        page: 1,
        totalPages: 1,
        total: 0,
        limit: 20,
      },
    [response]
  );

  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];

    if (queryParams.search) {
      filters.push({
        key: "search",
        label: `Search: "${queryParams.search}"`,
        onRemove: () => {
          setSearchTerm("");
          updateParams({ search: undefined, page: 1 });
        },
      });
    }

    if (queryParams.dialect_id) {
      const match = dialects.find(
        (d) => d.id === Number(queryParams.dialect_id)
      );
      filters.push({
        key: "dialect_id",
        label: `Dialect: ${match?.label || queryParams.dialect_id}`,
        onRemove: () => updateParams({ dialect_id: undefined, page: 1 }),
      });
    }

    if (queryParams.category_id) {
      const match = categories.find(
        (c) => c.id === Number(queryParams.category_id)
      );
      filters.push({
        key: "category_id",
        label: `Category: ${match?.label || queryParams.category_id}`,
        onRemove: () => updateParams({ category_id: undefined, page: 1 }),
      });
    }

    if (queryParams.part_of_speech_id) {
      const match = posList.find(
        (p) => p.id === Number(queryParams.part_of_speech_id)
      );
      filters.push({
        key: "part_of_speech_id",
        label: `POS: ${match?.label || queryParams.part_of_speech_id}`,
        onRemove: () => updateParams({ part_of_speech_id: undefined, page: 1 }),
      });
    }

    if (queryParams.region_id) {
      const match = regions.find((r) => r.id === Number(queryParams.region_id));
      filters.push({
        key: "region_id",
        label: `Region: ${match?.label || queryParams.region_id}`,
        onRemove: () => updateParams({ region_id: undefined, page: 1 }),
      });
    }

    if (queryParams.contribution_source) {
      filters.push({
        key: "contribution_source",
        label: `Source: ${queryParams.contribution_source}`,
        onRemove: () =>
          updateParams({ contribution_source: undefined, page: 1 }),
      });
    }

    return filters;
  }, [queryParams, dialects, categories, posList, regions, updateParams]);

  const handleResetAllFilters = useCallback(() => {
    setSearchTerm("");
    updateParams({
      search: undefined,
      dialect_id: undefined,
      category_id: undefined,
      part_of_speech_id: undefined,
      region_id: undefined,
      contribution_source: undefined,
      sort_by: "created_at",
      sort_order: "desc",
      page: 1,
    });
  }, [updateParams]);

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden">
      <DatasetToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        queryParams={queryParams}
        updateParams={updateParams}
        dialects={dialects}
        categories={categories}
        posList={posList}
        regions={regions}
        activeFilters={activeFilters}
        handleResetAllFilters={handleResetAllFilters}
        isFetching={isFetching}
        isPending={isPending}
      />

      {/* Main Data Table */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
        {isLoading ? (
          <div className="flex-1 space-y-3 overflow-hidden p-4">
            {Array.from({ length: 10 }).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="size-8 text-destructive mb-2" />
            <p className="text-sm font-semibold">
              Failed to load dataset entries
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <Database className="size-8 text-muted-foreground mb-2 stroke-1" />
            <p className="text-sm font-semibold">
              No entries match your search criteria
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <DataTable columns={columns} data={entries} globalFilter="" />
          </div>
        )}
      </div>

      <DatasetPagination
        currentCount={entries.length}
        pagination={pagination}
        queryParams={queryParams}
        updateParams={updateParams}
        isFetching={isFetching}
      />
    </div>
  );
}
