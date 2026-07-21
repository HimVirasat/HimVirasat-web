import { API_URL } from "@/lib/constants";
import { SubmissionFormValues } from "@/types/admin/contribution-types";

export interface CreateSubmissionPayload {
  dialect_id: number;
  category_id?: number | null;
  part_of_speech_id?: number | null;
  word_devanagari: string;
  word_latin?: string | null;
  word_takri?: string | null;
  ipa?: string | null;
  meaning: string;
  meaning_hindi?: string | null;
  meaning_english?: string | null;
  example_sentence?: string | null;
  example_sentence_hindi?: string | null;
  example_sentence_english?: string | null;
  example_sentence_latin?: string | null;
  example_sentence_takri?: string | null;
  region?: string | null;
}

export class SubmissionService {
  /**
   * Posts a new vocabulary contribution to POST /submissions
   */
  static async createSubmission(formData: SubmissionFormValues): Promise<any> {
    const payload: CreateSubmissionPayload = {
      dialect_id: Number(formData.dialect_id),
      category_id: formData.category_id ? Number(formData.category_id) : null,
      part_of_speech_id: formData.part_of_speech_id
        ? Number(formData.part_of_speech_id)
        : null,
      word_devanagari: formData.word_devanagari.trim(),
      word_latin: formData.word_latin?.trim() || null,
      word_takri: formData.word_takri?.trim() || null,
      ipa: formData.ipa?.trim() || null,
      meaning: (formData.meaning || formData.meaning_hindi || "").trim(),
      meaning_hindi: formData.meaning_hindi?.trim() || null,
      meaning_english: formData.meaning_english?.trim() || null,
      example_sentence: formData.example_sentence?.trim() || null,
      example_sentence_hindi: formData.example_sentence_hindi?.trim() || null,
      example_sentence_english:
        formData.example_sentence_english?.trim() || null,
      example_sentence_latin: formData.example_sentence_latin?.trim() || null,
      example_sentence_takri: formData.example_sentence_takri?.trim() || null,
      region: formData.region?.trim() || null,
    };

    // Option A: Comma-separated (best for devtools inspectable tree)
    console.log("Sending the data:", payload);

    // Option B: Stringified (forces full JSON expansion)
    // console.log("Sending the data: " + JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_URL}/submissions`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.error || data?.message || "Failed to post submission"
      );
    }

    return data?.data ?? data;
  }
}
