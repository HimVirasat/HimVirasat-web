import type { Request, Response } from "express";
import { supabase } from "../services/supabase.js";

/**
 * Fetches all active dialects from the database
 */
export async function getDialectsHandler(_req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from("dialects")
      .select("name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase Error fetching dialects:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve dialects dataset",
      });
    }

    // Flatten array of objects [{ name: "..." }] into an array of strings ["..."]
    const dialects = data ? data.map((row) => row.name) : [];

    return res.status(200).json({
      success: true,
      data: dialects,
    });
  } catch (error) {
    console.error("Internal catch error inside getDialectsHandler:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Fetches all categories options from the database
 */
export async function getCategoriesHandler(_req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase Error fetching categories:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve categories dataset",
      });
    }

    const categories = data ? data.map((row) => row.name) : [];

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Internal catch error inside getCategoriesHandler:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Fetches all parts of speech classifications from the database
 */
export async function getPartsOfSpeechHandler(_req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from("parts_of_speech")
      .select("name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase Error fetching parts_of_speech:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve parts of speech dataset",
      });
    }

    const partsOfSpeech = data ? data.map((row) => row.name) : [];

    return res.status(200).json({
      success: true,
      data: partsOfSpeech,
    });
  } catch (error) {
    console.error(
      "Internal catch error inside getPartsOfSpeechHandler:",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
