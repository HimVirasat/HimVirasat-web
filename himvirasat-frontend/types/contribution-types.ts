export interface ContributorStats {
  username: string;
  totalPoints: number;
  rank: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
}

export interface SubmissionForm {
  username: string;
  dialect: string;

  wordDevanagari: string;
  meaning: string;
  sentence: string;

  ipa?: string;
  tankri?: string;
  transliteration?: string;
  category?: string;
  region?: string;
  partOfSpeech?: string;
}

const mockStats: ContributorStats = {
  username: "chaitanya",
  totalPoints: 42,
  rank: 12,
  approvedSubmissions: 18,
  pendingSubmissions: 4,
  rejectedSubmissions: 1,
};