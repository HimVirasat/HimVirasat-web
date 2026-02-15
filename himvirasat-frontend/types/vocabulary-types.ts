export type VocabularyEntry = {
  word_native: string;
  word_meaning_en: string;
  sentence_native: string;
  sentence_meaning_en: string;
  dialect: string;
  region: string | null;
  contributor_username: string | null;
};
