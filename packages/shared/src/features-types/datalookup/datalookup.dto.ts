import { z } from "zod";

export const GenerateMetadataInputSchema = z.object({
  word_devanagari: z.string().min(1, "Devanagari word is required"),
  meaning_hindi: z.string().optional(),
  meaning_english: z.string().optional(),
  example_sentence: z.string().optional(),
});
export type GenerateMetadataInput = z.infer<typeof GenerateMetadataInputSchema>;

export interface LinguisticMetadata {
  word_latin: string;
  word_takri: string;
  ipa: string;
  example_sentence_latin: string;
  example_sentence_takri: string;
}

export interface MetadataGenerationResult {
  model: string;
  data: LinguisticMetadata;
}
