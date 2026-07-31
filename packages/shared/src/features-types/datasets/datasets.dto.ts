import { z } from 'zod';
import { ContributionSourceEnum } from '../db/dataset.js'; // your existing enum

export const fetchDatasetsQueryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  language_id: z.coerce.number().int().positive().optional(),
  dialect_id: z.coerce.number().int().positive().optional(),
  region_id: z.coerce.number().int().positive().optional(),
  category_id: z.coerce.number().int().positive().optional(),
  part_of_speech_id: z.coerce.number().int().positive().optional(),
  contribution_source: ContributionSourceEnum.optional(),
  sort_by: z.enum(['created_at', 'published_at', 'word_devanagari', 'word_latin']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export type FetchDatasetsQueryParams = z.infer<typeof fetchDatasetsQueryParamsSchema>;