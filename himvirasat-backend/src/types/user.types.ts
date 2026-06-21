export interface LanguageExpertDto {
  id: string;
  username: string;
  full_name: string;
  email: string | null;
  dialects: string[];
  is_active: boolean;
  created_at: string;
  points: number;
}
