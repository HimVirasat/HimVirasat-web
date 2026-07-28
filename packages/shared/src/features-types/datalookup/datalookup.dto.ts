import { z } from "zod";

// --- Request Schema ---
export const GenerateMetadataInputSchema = z.object({
  word_devanagari: z.string().min(1, "Devanagari word is required"),
  meaning_hindi: z.string().optional(),
  meaning_english: z.string().optional(),
  example_sentence: z.string().optional(),
});
export type GenerateMetadataInput = z.infer<typeof GenerateMetadataInputSchema>;

// --- Internal Data Shape ---
export interface LinguisticMetadata {
  word_latin: string;
  word_takri: string;
  ipa: string;
  example_sentence_latin: string;
  example_sentence_takri: string;
}

// --- Response Contract ---
export interface MetadataGenerationResult {
  model: string;
  data: LinguisticMetadata;
}