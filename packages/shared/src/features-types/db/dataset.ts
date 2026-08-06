import { z } from 'zod';

// ==========================================
// 1. Enums
// ==========================================
export const ContributionSourceEnum = z.enum(['discord', 'reddit', 'anonymous']);
export type ContributionSource = z.infer<typeof ContributionSourceEnum>;

// ==========================================
// 2. Base Zod Schema (For Validation)
// ==========================================
export const datasetEntrySchema = z.object({
  id: z.string().uuid(),
  
  // Foreign Keys (Nullable / Optional)
  contributor_id: z.string().uuid().nullable().optional(),
  language_id: z.number().int().positive(),
  dialect_name: z.string().min(1),
  region_id: z.number().int().positive().nullable().optional(),
  category_id: z.number().int().positive().nullable().optional(),
  part_of_speech_id: z.number().int().positive().nullable().optional(),

  // Word Fields
  word_devanagari: z.string().min(1).max(255),
  word_latin: z.string().max(255).nullable().optional(),
  word_takri: z.string().max(255).nullable().optional(),
  word_ipa: z.string().max(255).nullable().optional(),

  // Meaning Fields
  meaning_hindi: z.string().nullable().optional(),
  meaning_english: z.string().nullable().optional(),

  // Sentence Fields
  sentence_devanagari: z.string().nullable().optional(),
  sentence_latin: z.string().nullable().optional(),
  sentence_takri: z.string().nullable().optional(),
  sentence_ipa: z.string().nullable().optional(),
  sentence_meaning_hindi: z.string().nullable().optional(),
  sentence_meaning_english: z.string().nullable().optional(),

  // Metadata
  contribution_source: ContributionSourceEnum.nullable().optional(),
  published_at: z.string().datetime().or(z.date()),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date()),
});

// ==========================================
// 3. Helper Schemas (Form & DB Operations)
// ==========================================

/**
 * For creating a new entry (omits auto-generated ID & timestamps)
 */
export const createDatasetEntrySchema = datasetEntrySchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    published_at: datasetEntrySchema.shape.published_at.optional(),
  });

/**
 * For updating an existing entry
 */
export const updateDatasetEntrySchema = createDatasetEntrySchema.partial();

// Full database row entry (Backend / API Response type)
export type DatasetEntry = z.infer<typeof datasetEntrySchema>;

// Insert Payload Type (Supabase Insert / Frontend Form Submission)
export type CreateDatasetEntryInput = z.infer<typeof createDatasetEntrySchema>;

// Update Payload Type
export type UpdateDatasetEntryInput = z.infer<typeof updateDatasetEntrySchema>;
