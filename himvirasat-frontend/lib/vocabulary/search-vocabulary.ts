import { VocabularyEntry } from "../../types/vocabulary/vocabulary-types";

function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }
  return matrix[b.length][a.length];
}

export function cleanText(text: string): string {
  return text
    .replace(/\s*\([^)]*\)/g, "") // Remove everything in brackets
    .trim()
    .toLowerCase();
}

export default function searchVocabulary(
  data: VocabularyEntry[],
  query: string,
  options?: { dialect?: string; limit?: number }
): VocabularyEntry[] {
  const { dialect, limit } = options || {};
  const q = query.trim().toLowerCase();

  let filtered = data.filter((e) => {
    if (!dialect) return true;
    return e.dialect.toLowerCase().includes(dialect.toLowerCase());
  });

  if (!q) {
    return limit ? filtered.slice(0, limit) : filtered;
  }

  const results = filtered
    .map((entry) => {
      const native = cleanText(entry.word_native);
      const english = entry.word_meaning_en.toLowerCase();

      let score = 100;

      // 1. EXACT MATCH (Highest Priority)
      if (native === q || english === q) {
        score = 0;
      }
      // 2. STARTS WITH
      else if (native.startsWith(q) || english.startsWith(q)) {
        score = 1;
      }
      // 3. CONTAINS
      else if (native.includes(q) || english.includes(q)) {
        score = 2;
      }
      // 4. SMART FUZZY MATCHING
      else {
        const distance = Math.min(
          getLevenshteinDistance(q, native),
          getLevenshteinDistance(q, english)
        );

        const maxAllowedDistance = Math.max(1, Math.floor(q.length / 2.5));

        if (distance <= maxAllowedDistance) {
          score = distance + 3;
        }
      }

      return { entry, score };
    })
    // 5. Filter out everything that didn't get a good score
    .filter((item) => item.score <= 15) // Increased threshold for forgiveness
    .sort((a, b) => a.score - b.score)
    .map((item) => item.entry);

  return typeof limit === "number" ? results.slice(0, limit) : results;
}
