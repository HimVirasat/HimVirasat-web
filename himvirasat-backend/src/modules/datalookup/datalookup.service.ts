import {
  LookupsService,
  lookupsService,
} from "./lookups/lookups.service.js";
import {
  AuditLogsService,
  auditLogsService,
  PaginatedLogsResponse,
} from "./audit-logs/audit-logs.service.js";
import {
  MetadataService,
  metadataService,
} from "./metadata/metadata.service.js";
import type { DynamicLookupOption } from "./datalookup.repository.js";

export type { DynamicLookupOption };
export type { PaginatedLogsResponse };

/**
 * Facade service that delegates to the split sub-module services.
 * Kept for backward compatibility with the module barrel exports.
 */
export class DataLookupService {
  fetchDialects: LookupsService["fetchDialects"];
  fetchCategories: LookupsService["fetchCategories"];
  fetchPartsOfSpeech: LookupsService["fetchPartsOfSpeech"];
  fetchAvailableRegions: LookupsService["fetchAvailableRegions"];
  getActivityLogs: AuditLogsService["getActivityLogs"];
  getErrorLogs: AuditLogsService["getErrorLogs"];
  generateLinguisticMetadata: MetadataService["generateLinguisticMetadata"];

  constructor(
    lookups: LookupsService = lookupsService,
    auditLogs: AuditLogsService = auditLogsService,
    metadata: MetadataService = metadataService,
  ) {
    this.fetchDialects = lookups.fetchDialects.bind(lookups);
    this.fetchCategories = lookups.fetchCategories.bind(lookups);
    this.fetchPartsOfSpeech = lookups.fetchPartsOfSpeech.bind(lookups);
    this.fetchAvailableRegions = lookups.fetchAvailableRegions.bind(lookups);
    this.getActivityLogs = auditLogs.getActivityLogs.bind(auditLogs);
    this.getErrorLogs = auditLogs.getErrorLogs.bind(auditLogs);
    this.generateLinguisticMetadata =
      metadata.generateLinguisticMetadata.bind(metadata);
  }
}

export const dataLookupService = new DataLookupService();
