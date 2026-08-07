import { z } from "zod";


export const MethodsSchema = z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]);
export type METHODS = z.infer<typeof MethodsSchema>;

export const CodesSchema = z.enum(["200", "201", "400", "401", "403", "404", "500", "501"]);
export type CODES = z.infer<typeof CodesSchema>;

export const EntityTypeSchema = z.enum([
    "user",
    "hv_system",
    "contribution",
    "dataset_entry",
    "review_item",
]);
export type ENTITY_TYPE = z.infer<typeof EntityTypeSchema>;

export const LogStatusSchema = z.enum(["SUCCESS", "FAILED"]);
export type LOG_STATUS = z.infer<typeof LogStatusSchema>;

export const BackendModuleCategoriesSchema = z.enum([
    "auth",
    "dashboard",
    "datalookup",
    "review_queue",
    "submissions",
    "users",
    "datasets",
]);
export type BACKEND_MODULE_CATEGORIES = z.infer<typeof BackendModuleCategoriesSchema>;

export const BackendServicesSchema = z.enum([
    "USER_SERVICE",
    "SUBMISSION_SERVICE",
    "DATASET_SERVICE",
    "AUTH_SERVICE",
    "REVIEWQUEUE_SERVICE",
    "DATALOOKUP_SERVICE",
    "DASHBOARD_SERVICE",
]);
export type BACKEND_SERVICES = z.infer<typeof BackendServicesSchema>;

export const BackendControllersSchema = z.enum([
    "USER_CONTROLLER",
    "SUBMISSION_CONTROLLER",
    "DATASET_CONTROLLER",
    "AUTH_CONTROLLER",
    "REVIEW_QUEUE_CONTROLLER",
    "DATALOOKUP_CONTROLLER",
    "DASHBOARD_CONTROLLER",
]);
export type BACKEND_CONTROLLERS = z.infer<typeof BackendControllersSchema>;

export const StatusCodeSchema = z.enum(["SUCCESS", "FAILED"]);
export type STATUS_CODE = z.infer<typeof StatusCodeSchema>;

export const ActionSchema = z.enum([
    "CREATE_LANGUAGE_EXPERT",
    "DELETE_LANGUAGE_EXPERT",
    "CREATE_LANGUAGE_HEAD",
    "DELETE_LANGUAGE_HEAD",
    "FETCH_LANGUAGE_EXPERT",
    "FETCH_LANGUAGE_HEADS",
    "UPDATE_EXPERT_DIALECTS",
    "UPDATE_HEAD_DIALECTS",
    "CREATE_SUBMISSION",
    "CREATE_REVIEW_QUEUE",
    "CREATE_CONTRIBUTION_SUBMISSION",
    "GET_REVIEW_QUEUE",
    "GET_REVIEW_BY_ID",
    "UPDATE_REVIEW_QUEUE",
    "UPDATE_REVIEW_QUEUE_STATUS",
    "UPDATE_CONTRIBUTION",
    "CONTRIBUTION_STATUS_UPDATED",
    "AWARD_POINTS",
    "AWARD_REVIEWER_POINTS",
    "CONTRIBUTION_DELETED",
    "AWARD_CONTRIBUTOR_POINTS",
    "COMMENT_ADDED",
    "COMMENT_STATUS_UPDATED",
    "AWARD_COMMENT_POINTS",
    "FETCH_DATASET_ENTRIES",
    "FETCH_DATASET_ENTRY_BY_ID",
    "DELETE_REVIEW_QUEUE",
    "ADD_REVIEW_QUEUE_COMMENT",
    "UPDATE_REVIEW_QUEUE_COMMENT_STATUS",
    "GET_ENTRIES",
    "GET_ENTRY_BY_ID",
    "GET_DASHBOARD_STATS",
    "GET_DIALECTS",
    "GET_CATEGORIES",
    "GET_PARTS_OF_SPEECH",
    "GET_AVAILABLE_REGIONS",
    "GET_ACTIVITY_LOGS",
    "GET_ERROR_LOGS",
    "GET_LANGUAGE_EXPERTS",
    "GET_LANGUAGE_HEAD",
    "GENERATE_METADATA",
    "LOGIN",
    "SIGNUP",
    "ME",
    "LOGOUT",
    "RESET_PASSWORD",
    "GET_MY_PROFILE",
    "GET_DASHBOARD_USERS_BY_ROLE",
]);
export type ACTION = z.infer<typeof ActionSchema>;

export type BACKEND_CODE = `${BACKEND_SERVICES | BACKEND_CONTROLLERS}:${STATUS_CODE}_${ACTION}`;

export const BackendCodeSchema = z.custom<BACKEND_CODE>((val) => {
    if (typeof val !== "string") return false;
    const parts = val.split(":");
    if (parts.length !== 2) return false;

    const [caller, actionPart] = parts;
    const validCallers = [
        ...BackendServicesSchema.options,
        ...BackendControllersSchema.options,
    ];

    if (!validCallers.includes(caller as any)) return false;

    const firstUnderscoreIdx = actionPart.indexOf("_");
    if (firstUnderscoreIdx === -1) return false;

    const status = actionPart.substring(0, firstUnderscoreIdx);
    const action = actionPart.substring(firstUnderscoreIdx + 1);

    return (
        StatusCodeSchema.options.includes(status as any) &&
        ActionSchema.options.includes(action as any)
    );
}, { message: "Invalid BACKEND_CODE format. Expected 'SERVICE_OR_CONTROLLER:STATUS_ACTION'" });


export const LogActivityParamsSchema = z.object({
    action: ActionSchema,
    entityType: EntityTypeSchema,
    backendModuleCategory: BackendModuleCategoriesSchema,
    backendCode: BackendCodeSchema,
    logStatus: LogStatusSchema,
    actorUserId: z.string().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});
export type LogActivityParams = z.infer<typeof LogActivityParamsSchema>;

export const LogErrorParamsSchema = z.object({
    action: ActionSchema,
    errorMessage: z.string(),
    serviceCategory: BackendModuleCategoriesSchema,
    backendCode: BackendCodeSchema,
    code: CodesSchema,
    actorUserId: z.string().nullable().optional(),
    logStatus: LogStatusSchema.optional().default("FAILED"),
    stackTrace: z.string().nullable().optional(),
    path: z.string().nullable().optional(),
    method: MethodsSchema.optional(),
    requestId: z.string().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});
export type LogErrorParams = z.infer<typeof LogErrorParamsSchema>;

export const ActivityLogSchema = z.object({
    id: z.string().uuid(),
    actor_id: z.string().nullable().optional(),
    action: ActionSchema,
    entity_type: EntityTypeSchema,
    service_category: BackendModuleCategoriesSchema,
    status: LogStatusSchema,
    backend_code: BackendCodeSchema,
    metadata: z.record(z.string(), z.unknown()).default({}),
    created_at: z.string(),
});
export type ActivityLog = z.infer<typeof ActivityLogSchema>;

export const ErrorLogSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().nullable().optional(),
    action: ActionSchema,
    error_message: z.string(),
    service_category: BackendModuleCategoriesSchema,
    stack_trace: z.string().nullable().optional(),
    code: CodesSchema,
    backend_code: BackendCodeSchema,
    path: z.string().nullable().optional(),
    method: MethodsSchema.nullable().optional(),
    request_id: z.string().nullable().optional(),
    status: LogStatusSchema,
    metadata: z.record(z.string(), z.unknown()).default({}),
    created_at: z.string(),
});
export type ErrorLog = z.infer<typeof ErrorLogSchema>;

export const GetLogsParamsSchema = z.object({
    service: BackendModuleCategoriesSchema.optional(),
    status: LogStatusSchema.optional(),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(20),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    hour: z.number().int().min(0).max(23).optional(),
    sort: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type GetLogsParams = z.infer<typeof GetLogsParamsSchema>;