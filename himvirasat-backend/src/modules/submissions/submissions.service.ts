/**
 * Submissions Service
 * File: submissions.service.ts
 */

import { randomUUID } from "crypto";
import {
  SubmissionsRepository,
  submissionsRepository,
} from "./submissions.repository.js";
import { ContributionRecord } from "@himvirasat/shared";
import { AuditLogger } from "../../utils/audit-logger.js";

export class SubmissionsService {
  constructor(
    private readonly repository: SubmissionsRepository = submissionsRepository,
  ) {}

  async createSubmission(
    contributorId: string,
    payload: Record<string, unknown>,
  ): Promise<ContributionRecord> {
    const contributionId = randomUUID();

    const contributionData = {
      id: contributionId,
      contributor_id: contributorId,
      ...payload,
      status: "under_review" as const,
    };

    const contribution =
      await this.repository.insertContribution(contributionData);

    await this.repository.insertHistory({
      contribution_id: contribution.id,
      actor_id: contributorId,
      type: "submitted",
      message: "New vocabulary entry submitted for review.",
    });

    await AuditLogger.logActivity({
      actorId: contributorId,
      action: "CREATE_SUBMISSION",
      entityType: "contribution",
      entityId: contribution.id,
      serviceCategory: "submissions",
      status: "SUCCESS",
      metadata: { dialect_id: payload.dialect_id, word: payload.word },
    });

    return contribution;
  }
}

export const submissionsService = new SubmissionsService();
