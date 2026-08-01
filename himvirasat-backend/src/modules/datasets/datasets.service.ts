import {
  DatasetsRepository,
  datasetsRepository,
  type DatasetQueryFilters,
  type PaginatedDatasetResult,
} from "./datasets.repository.js";
import type { DatasetEntry } from "@himvirasat/shared";
import { SecurityContext } from "../../utils/get-authenticated-user.js";

export class DatasetsService {
  constructor(
    private readonly repository: DatasetsRepository = datasetsRepository,
  ) {}

  async getEntries(
    _ctx: SecurityContext,
    query: Record<string, unknown>,
  ): Promise<PaginatedDatasetResult> {
    const filters: DatasetQueryFilters = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
      search: typeof query.search === "string" ? query.search : undefined,
      language_id: query.language_id ? Number(query.language_id) : undefined,
      dialect_id: query.dialect_id ? Number(query.dialect_id) : undefined,
      region_id: query.region_id ? Number(query.region_id) : undefined,
      category_id: query.category_id ? Number(query.category_id) : undefined,
      part_of_speech_id: query.part_of_speech_id
        ? Number(query.part_of_speech_id)
        : undefined,
      contribution_source:
        typeof query.contribution_source === "string"
          ? query.contribution_source
          : undefined,
      sort_by: typeof query.sort_by === "string" ? query.sort_by : "created_at",
      sort_order: query.sort_order === "asc" ? "asc" : "desc",
    };

    return await this.repository.findEntries(filters);
  }

  async getEntryById(_ctx: SecurityContext, id: string): Promise<DatasetEntry> {
    const entry = await this.repository.findEntryById(id);
    if (!entry) {
      throw new Error("Dataset entry not found");
    }
    return entry;
  }
}

export const datasetsService = new DatasetsService();
