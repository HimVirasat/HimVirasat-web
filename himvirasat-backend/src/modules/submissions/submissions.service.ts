import { randomUUID } from "crypto";
import * as repository from "./submissions.repository.js";

export async function createSubmission(contributorId: string, payload: any) {
  const contributionData = {
    id: randomUUID(),
    contributor_id: contributorId,
    ...payload,
    status: "under_review",
  };
  const contribution = await repository.insertContribution(contributionData);
  await repository.insertHistory({
    contribution_id: contribution.id,
    actor_id: contributorId,
    type: "submitted",
    message: "New vocabulary entry submitted for review.",
  });
  return contribution;
}