import {
  DataLookupRepository,
  dataLookupRepository,
  DynamicLookupOption,
} from "../datalookup.repository.js";
import { SecurityContext } from "../../../utils/get-authenticated-user.js";

export class LookupsService {
  constructor(
    private readonly repository: DataLookupRepository = dataLookupRepository,
  ) {}

  async fetchDialects(_ctx: SecurityContext): Promise<string[]> {
    return await this.repository.getDialects();
  }

  async fetchCategories(_ctx: SecurityContext): Promise<DynamicLookupOption[]> {
    return await this.repository.getCategories();
  }

  async fetchPartsOfSpeech(
    _ctx: SecurityContext,
  ): Promise<DynamicLookupOption[]> {
    return await this.repository.getPartsOfSpeech();
  }

  async fetchAvailableRegions(
    _ctx: SecurityContext,
  ): Promise<DynamicLookupOption[]> {
    return await this.repository.getAvailableRegions();
  }
}

export const lookupsService = new LookupsService();
