import {
  LookupsController,
  lookupsController,
} from "./lookups/lookups.controller.js";
import {
  AuditLogsController,
  auditLogsController,
} from "./audit-logs/audit-logs.controller.js";
import {
  MetadataController,
  metadataController,
} from "./metadata/metadata.controller.js";

/**
 * Facade controller that delegates to the split sub-module controllers.
 * Kept for backward compatibility with the module barrel exports.
 */
export class DataLookupController {
  getDialects: LookupsController["getDialects"];
  getCategories: LookupsController["getCategories"];
  getPartsOfSpeech: LookupsController["getPartsOfSpeech"];
  getAvailableRegions: LookupsController["getAvailableRegions"];
  getActivityLogs: AuditLogsController["getActivityLogs"];
  getErrorLogs: AuditLogsController["getErrorLogs"];
  generateMetadata: MetadataController["generateMetadata"];

  constructor(
    lookups: LookupsController = lookupsController,
    auditLogs: AuditLogsController = auditLogsController,
    metadata: MetadataController = metadataController,
  ) {
    this.getDialects = lookups.getDialects;
    this.getCategories = lookups.getCategories;
    this.getPartsOfSpeech = lookups.getPartsOfSpeech;
    this.getAvailableRegions = lookups.getAvailableRegions;
    this.getActivityLogs = auditLogs.getActivityLogs;
    this.getErrorLogs = auditLogs.getErrorLogs;
    this.generateMetadata = metadata.generateMetadata;
  }
}

export const dataLookupController = new DataLookupController();
