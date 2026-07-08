// utils/fetchLookups.ts
export interface LookupData {
  dialects: string[];
  categories: string[];
  partsOfSpeech: string[];
}

export async function fetchFormLookups(): Promise<LookupData> {
  const response = await fetch("/api/datalookup");
  if (!response.ok) {
    throw new Error("Failed to pull active database reference listings");
  }
  return response.json();
}
