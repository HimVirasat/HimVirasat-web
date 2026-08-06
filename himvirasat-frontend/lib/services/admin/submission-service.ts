import { API_URL } from "@/lib/constants";
import type { ApiResponse, CreateSubmissionDto } from "@himvirasat/shared";

// Local payload type expected by your Express backend API
export type CreateSubmissionPayload = Omit<CreateSubmissionDto, "meaning"> & {
  meaning: string;
};

export class SubmissionService {
  /**
   * Posts a new vocabulary contribution to POST /submissions
   */
  static async createSubmission(
    formData: CreateSubmissionDto
  ): Promise<ApiResponse<unknown>> {
    // Standardize meaning field fallback
    const computedMeaning = (
      formData.meaning ||
      formData.meaning_hindi ||
      ""
    ).trim();

    const payload: CreateSubmissionPayload = {
      dialect_name: formData.dialect_name.trim(),
      category_id: formData.category_id ? Number(formData.category_id) : null,
      part_of_speech_id: formData.part_of_speech_id
        ? Number(formData.part_of_speech_id)
        : null,
      word_devanagari: formData.word_devanagari.trim(),
      word_latin: formData.word_latin?.trim() || null,
      word_takri: formData.word_takri?.trim() || null,
      ipa: formData.ipa?.trim() || null,
      meaning: computedMeaning,
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

    console.log("Sending submission payload:", payload);

    const response = await fetch(`${API_URL}/submissions`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({
      success: false,
      error: "Failed to parse response payload.",
    }))) as ApiResponse<unknown>;

    if (!response.ok) {
      throw new Error(
        data?.error || data?.message || "Failed to post submission"
      );
    }

    return data;
  }
}
