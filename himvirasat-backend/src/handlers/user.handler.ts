import { Request, Response } from "express";

import { supabase } from "../services/supabase.js";

import type { LanguageExpertDto } from "../types/user.types.js";

export async function getLanguageExperts(
  _: Request,
  res: Response
) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        username,
        full_name,
        email,
        dialects,
        is_active,
        created_at,
        points
      `
      )
      .eq("role", "language_expert")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    const experts =
      data as LanguageExpertDto[];

    return res.json({
      success: true,
      experts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch language experts",
    });
  }
}