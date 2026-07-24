import { z } from "zod";

const optionalText = z.string().trim().nullable().optional();

export const CreateSubmissionSchema = z.object({
  dialect_id: z.number().int().positive("dialect_id is required."),
  category_id: z.number().int().positive().nullable().optional(),
  part_of_speech_id: z.number().int().positive().nullable().optional(),
  word_devanagari: z
    .string()
    .trim()
    .min(1, "Devanagari word cannot be empty."),
  word_latin: optionalText,
  word_takri: optionalText,
  ipa: optionalText,
  meaning: z.string().trim().min(1, "Meaning is required."),
  meaning_hindi: optionalText,
  meaning_english: optionalText,
  example_sentence: optionalText,
  example_sentence_hindi: optionalText,
  example_sentence_english: optionalText,
  example_sentence_latin: optionalText,
  example_sentence_takri: optionalText,
  region: optionalText,
});

export type CreateSubmissionPayload = z.infer<typeof CreateSubmissionSchema>;

export type CreateSubmissionDto = CreateSubmissionPayload;
