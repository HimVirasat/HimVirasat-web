import { supabase } from "../../services/supabase.js";
import type { DatasetEntry } from "@himvirasat/shared";

export interface DatasetQueryFilters {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  language_id?: number | undefined;
  dialect_id?: number | undefined;
  region_id?: number | undefined;
  category_id?: number | undefined;
  part_of_speech_id?: number | undefined;
  contribution_source?: string | undefined;
  sort_by?: string | undefined;
  sort_order?: "asc" | "desc" | undefined;
}

export interface PaginatedDatasetResult {
  data: DatasetEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DatasetsRepository {
  async findEntries(
    filters: DatasetQueryFilters,
  ): Promise<PaginatedDatasetResult> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const offset = (page - 1) * limit;

    let query = supabase.from("dataset_entries").select(
      `
        *,
        dialects:dialect_id ( id, name ),
        categories:category_id ( id, name ),
        parts_of_speech:part_of_speech_id ( id, name ),
        regions:region_id ( id, name )
      `,
      { count: "exact" },
    );

    // 1. Full-Text Search
    if (filters.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      query = query.or(
        `word_devanagari.ilike.${term},word_latin.ilike.${term},word_takri.ilike.${term},meaning_english.ilike.${term},meaning_hindi.ilike.${term}`,
      );
    }

    // 2. Foreign Key Filters
    if (filters.language_id)
      query = query.eq("language_id", filters.language_id);
    if (filters.dialect_id) query = query.eq("dialect_id", filters.dialect_id);
    if (filters.region_id) query = query.eq("region_id", filters.region_id);
    if (filters.category_id)
      query = query.eq("category_id", filters.category_id);
    if (filters.part_of_speech_id)
      query = query.eq("part_of_speech_id", filters.part_of_speech_id);

    // 3. Enum Filter
    if (filters.contribution_source) {
      query = query.eq("contribution_source", filters.contribution_source);
    }

    // 4. Dynamic Sorting
    const sortBy = filters.sort_by || "created_at";
    const isAscending = filters.sort_order === "asc";
    query = query.order(sortBy, { ascending: isAscending });

    // 5. Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Database Error: ${error.message}`);
    }

    const formattedData = (data || []).map((entry: any) => ({
      ...entry,
      dialect_name: entry.dialects?.name || null,
      category_name: entry.categories?.name || null,
      pos_name: entry.parts_of_speech?.name || null,
      region_name: entry.regions?.name || null,
    }));

    const total = count || 0;

    return {
      data: formattedData as DatasetEntry[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findEntryById(id: string): Promise<DatasetEntry | null> {
    const { data, error } = await supabase
      .from("dataset_entries")
      .select(
        `
        *,
        dialects:dialect_id ( id, name ),
        categories:category_id ( id, name ),
        parts_of_speech:part_of_speech_id ( id, name ),
        regions:region_id ( id, name )
      `,
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Database Error: ${error.message}`);
    }

    if (!data) return null;

    return {
      ...data,
      dialect_name: (data as any).dialects?.name || null,
      category_name: (data as any).categories?.name || null,
      pos_name: (data as any).parts_of_speech?.name || null,
      region_name: (data as any).regions?.name || null,
    } as DatasetEntry;
  }
}

export const datasetsRepository = new DatasetsRepository();