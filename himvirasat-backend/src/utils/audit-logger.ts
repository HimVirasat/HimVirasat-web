import { supabase } from "../services/supabase.js";
import { logger } from "./logger.js";
import {
  LogActivityParams,
  LogActivityParamsSchema,
  LogErrorParams,
  LogErrorParamsSchema,
} from "@himvirasat/shared";

export class AuditLogger {
  static async logActivity(rawParams: LogActivityParams): Promise<void> {
    try {
      // Validate schema at runtime
      const params = LogActivityParamsSchema.parse(rawParams);

      const payload = {
        actor_id: params.actorUserId || null,
        action: params.action,
        entity_type: params.entityType,
        service_category: params.backendModuleCategory,
        status: params.logStatus || "SUCCESS",
        backend_code: params.backendCode,
        metadata: params.metadata || {},
      };

      const { error } = await supabase.from("activity_logs").insert([payload]);
      if (error) {
        logger.error("Failed to write activity_log record:", error);
      }
    } catch (err: unknown) {
      logger.error(
        "Unexpected error or validation failure writing activity_log:",
        err,
      );
    }
  }
  static async logError(rawParams: LogErrorParams): Promise<void> {
    try {
      // Validate schema at runtime
      const params = LogErrorParamsSchema.parse(rawParams);

      const payload = {
        user_id: params.actorUserId || null,
        action: params.action,
        error_message: params.errorMessage,
        service_category: params.serviceCategory,
        stack_trace: params.stackTrace || null,
        code: params.code || "500",
        backend_code: params.backendCode,
        path: params.path || null,
        method: params.method || null,
        request_id: params.requestId || null,
        status: params.logStatus || "FAILED",
        metadata: params.metadata || {},
      };

      const { error } = await supabase.from("error_logs").insert([payload]);
      if (error) {
        logger.error("Failed to write error_log record:", error);
      }
    } catch (err: unknown) {
      logger.error(
        "Unexpected error or validation failure writing error_log:",
        err,
      );
    }
  }
}
