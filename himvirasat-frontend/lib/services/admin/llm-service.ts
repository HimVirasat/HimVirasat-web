export interface MetadataGenerationPayload {
  word_devanagari: string;
  meaning_hindi?: string;
  meaning_english?: string;
  example_sentence?: string;
}

export interface MetadataGenerationResult {
  word_latin?: string;
  word_takri?: string;
  ipa?: string;
  example_sentence_latin?: string;
  example_sentence_takri?: string;
}

export class LLMService {
  static async generateMetadata(
    payload: MetadataGenerationPayload
  ): Promise<MetadataGenerationResult> {
    const res = await fetch("/api/grok/generate-metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to generate metadata using Grok.");
    }

    return data as MetadataGenerationResult;
  }
}