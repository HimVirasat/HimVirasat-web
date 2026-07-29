import {z} from 'zod'

export const DashboardStatsSchema = z.object({
  languageExpertsCount: z.number().nonnegative(),
  languageHeadsCount: z.number().nonnegative(),
  superAdminsCount: z.number().nonnegative(),
});