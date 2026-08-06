import { z } from "zod";

export const AwardPointsPayloadSchema = z.object({
  userId: z.string(),
  points: z.number().int(),
  reason: z.enum(["contribution_approved", "review_completed", "comment_accepted"]),
  referenceId: z.string(),
  dialectName: z.string().optional(),
  isContributor: z.boolean(),
});

export type AwardPointsPayload = z.infer<typeof AwardPointsPayloadSchema>;
