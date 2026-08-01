import { supabase } from "../services/supabase.js";
import { logger } from "./logger.js";
import { ServiceCategory, LogStatus } from "@himvirasat/shared";

export interface LogActivityParams {
  action: string;
  entityType: string;
  serviceCategory: ServiceCategory;
  actorId?: string | null;
  status?: LogStatus;
  code?: string,
  metadata?: Record<string, unknown>;
  entityId?: string | null;
  backend_code?: string | undefined;

}

export interface LogErrorParams {
  errorMessage: string;
  serviceCategory: ServiceCategory;
  userId?: string | null | undefined;
  stackTrace?: string | null | undefined;
  code?: string | undefined;
  backend_code?: string | undefined;
  path?: string | null | undefined;
  method?: string | null | undefined;
  requestId?: string | null | undefined;
  status?: LogStatus | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export class AuditLogger {
  /**
   * Log business domain activity / success audit trails
   */
  static async logActivity(params: LogActivityParams): Promise<void> {
    const payload = {
      actor_id: params.actorId || null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      service_category: params.serviceCategory,
      status: params.status || "SUCCESS",
      metadata: params.metadata || {},
    };

    try {
      const { error } = await supabase.from("activity_logs").insert([payload]);
      if (error) {
        logger.error("Failed to write activity_log record:", error);
      }
    } catch (err: unknown) {
      logger.error("Unexpected error writing activity_log:", err);
    }
  }

  /**
   * Log runtime exceptions and system errors
   */
  static async logError(params: LogErrorParams): Promise<void> {
    const payload = {
      user_id: params.userId || null,
      error_message: params.errorMessage,
      service_category: params.serviceCategory,
      stack_trace: params.stackTrace || null,
      code: params.code || "UNKNOWN_ERROR",
      path: params.path || null,
      method: params.method || null,
      request_id: params.requestId || null,
      status: params.status || "FAILED",
      metadata: params.metadata || {},
    };

    try {
      const { error } = await supabase.from("error_logs").insert([payload]);
      if (error) {
        logger.error("Failed to write error_log record:", error);
      }
    } catch (err: unknown) {
      logger.error("Unexpected error writing error_log:", err);
    }
  }
}
