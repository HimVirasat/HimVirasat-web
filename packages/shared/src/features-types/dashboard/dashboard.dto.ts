import {z} from 'zod'
import { SystemRole, SystemRoleSchema } from '../../common/roles.js';

// old type forget this dont use this anywhere
// export const DashboardStatsSchema = z.object({
//   languageExpertsCount: z.number().nonnegative(),
//   languageHeadsCount: z.number().nonnegative(),
//   superAdminsCount: z.number().nonnegative(),
// });

// 1. Base User Schema (Easily expandable as requirements grow)
export const DashboardUserSchema = z.object({
  id: z.string().uuid(), 
  userName: z.string(),
  fullName: z.string(),
  dialects: z.array(z.string()), 
});

// 2. Dashboard Response Schema
export const DashboardFetchUsersResponseSchema = z.object({
  role: SystemRoleSchema,
  totalCount: z.number().int().nonnegative(),
  users: z.array(DashboardUserSchema),
});

// 3. Exported Types
export type DashboardUser = z.infer<typeof DashboardUserSchema>;
export type DashboardFetchUsersResponse = z.infer<typeof DashboardFetchUsersResponseSchema>;

export interface UserProfileWithStats {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  role: SystemRole;
  dialects: string[];
  stats: {
    totalPoints: number;
    approvedEntriesCount: number;
    reviewsCompletedCount: number;
  };
}
