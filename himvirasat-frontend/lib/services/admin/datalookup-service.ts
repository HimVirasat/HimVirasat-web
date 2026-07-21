import { API_URL } from "@/lib/constants";

export interface GenerateMetadataPayload {
  word_devanagari: string;
  meaning_hindi?: string;
  meaning_english?: string;
  example_sentence?: string;
}

export interface GeneratedMetadataResult {
  word_latin?: string;
  word_takri?: string;
  ipa?: string;
  example_sentence_latin?: string;
  example_sentence_takri?: string;
}

export class DataLookupService {
  /**
   * Fetches all dynamic dialect strings from the database
   */
  static async getAvailableDialects(): Promise<string[]> {
    const response = await fetch(`${API_URL}/datalookup/available-dialects`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available dialects");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Fetches all functional category strings from the database
   */
  static async getAvailableCategories(): Promise<string[]> {
    const response = await fetch(`${API_URL}/datalookup/available-categories`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available categories");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Fetches all part of speech grammatical markers from the database
   */
  static async getAvailablePartsOfSpeech(): Promise<string[]> {
    const response = await fetch(`${API_URL}/datalookup/available-pos`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch available parts of speech");
    }

    const result = await response.json();
    return result.data;
  }
  static async generateMetadata(
    payload: GenerateMetadataPayload
  ): Promise<GeneratedMetadataResult> {
    const response = await fetch(`${API_URL}/datalookup/generate-metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to generate metadata");
    }

    return result.data;
  }
}
