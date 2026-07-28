import { supabase } from "../../services/supabase.js";

export class DataLookupRepository {
  async getDialects(): Promise<string[]> {
    const { data, error } = await supabase
      .from("dialects")
      .select("name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data ? data.map((row) => row.name) : [];
  }

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data ? data.map((row) => row.name) : [];
  }

  async getPartsOfSpeech(): Promise<string[]> {
    const { data, error } = await supabase
      .from("parts_of_speech")
      .select("name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data ? data.map((row) => row.name) : [];
  }
}

export const dataLookupRepository = new DataLookupRepository();