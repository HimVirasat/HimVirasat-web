import { supabase } from "../../services/supabase.js";
import {
  InsertContributionPayload,
  InsertSubmissionHistoryPayload,
  ContributionRecord,
} from "@himvirasat/shared";

export class SubmissionsRepository {
  async insertContribution(
    data: InsertContributionPayload,
  ): Promise<ContributionRecord> {
    const { data: contribution, error } = await supabase
      .from("contributions")
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return contribution as ContributionRecord;
  }

  async insertHistory(data: InsertSubmissionHistoryPayload): Promise<void> {
    const { error } = await supabase
      .from("contribution_history")
      .insert([data]);
    if (error) throw error;
  }
}

export const submissionsRepository = new SubmissionsRepository();
