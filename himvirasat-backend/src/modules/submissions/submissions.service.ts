import { randomUUID } from "crypto";
import {
  SubmissionsRepository,
  submissionsRepository,
} from "./submissions.repository.js";
import { ContributionRecord } from "@himvirasat/shared";

export class SubmissionsService {
  constructor(
    private readonly repository: SubmissionsRepository = submissionsRepository
  ) { }

  async createSubmission(
    contributorId: string,
    payload: Record<string, unknown>
  ): Promise<ContributionRecord> {
    const contributionId = randomUUID();

    const contributionData = {
      id: contributionId,
      contributor_id: contributorId,
      ...payload,
      status: "under_review" as const,
    };

    const contribution = await this.repository.insertContribution(
      contributionData
    );

    await this.repository.insertHistory({
      contribution_id: contribution.id,
      actor_id: contributorId,
      type: "submitted",
      message: "New vocabulary entry submitted for review.",
    });

    return contribution;
  }
}

export const submissionsService = new SubmissionsService();