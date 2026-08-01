import { randomUUID } from "crypto";
import {
  SubmissionsRepository,
  submissionsRepository,
} from "./submissions.repository.js";
import { ContributionRecord } from "@himvirasat/shared";
// import { AuditLogger } from "../../utils/audit-logger.js";
import { SecurityContext } from "../../utils/get-authenticated-user.js";

export class SubmissionsService {
  constructor(
    private readonly repository: SubmissionsRepository = submissionsRepository,
  ) {}

  async createSubmission(
    ctx: SecurityContext,
    payload: Record<string, unknown>,
  ): Promise<ContributionRecord> {
    const contributionId = randomUUID();

    const contributionData = {
      id: contributionId,
      contributor_id: ctx.actor.id,
      ...payload,
      status: "under_review" as const,
    };

    const contribution =
      await this.repository.insertContribution(contributionData);

    await this.repository.insertHistory({
      contribution_id: contribution.id,
      actor_id: ctx.actor.id,
      type: "submitted",
      message: "New vocabulary entry submitted for review.",
    });

    // await AuditLogger.logActivity({
    //   actorId: ctx.actor.id,
    //   action: "CREATE_SUBMISSION",
    //   entityType: "contribution",
    //   entityId: contribution.id,
    //   serviceCategory: "submissions",
    //   status: "SUCCESS",
    //   metadata: {
    //     dialect_id: payload.dialect_id,
    //     word: payload.word,
    //     detailed_user: ctx.actor,
    //   },
    // });

    return contribution;
  }
}

export const submissionsService = new SubmissionsService();
