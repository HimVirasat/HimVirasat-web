import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { supabase } from "../services/supabase.js";

import type { LanguageExpertDto } from "../types/user.types.js";
// import { User } from "../types/auth.types.js";
// import { success } from "zod";

export async function getLanguageExperts(_: Request, res: Response) {
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
      `,
      )
      .eq("role", "language_expert")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }
    const experts = data as LanguageExpertDto[];

    return res.json({
      success: true,
      experts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch language experts",
    });
  }
}

export async function createLanguageExpert(req: Request, res: Response) {
  try {
    const { fullName, email, username, password, dialects } = req.body;
    console.log(req.body);

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        password_hash: passwordHash,
        full_name: fullName,
        email,
        role: "language_expert",
        dialects,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Language expert created successfully",
      expert: {
        id: data.id,
        username: data.username,
        dialects: data.dialects,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create language expert",
    });
  }
}
export async function deleteLanguageExpert(req: Request, res: Response) {
  try {
    const body = req.body;
    const { error } = await supabase.from("users").delete().eq('id', body.id);
    if (error) {
      return res.status(404).json({
        success: false,
        message: "Unable to delete Language Expert",
        error: error
      });
    }

    return res.status(201).json({
      success: true,
      message: "Language Expert Deleted",
      deleted_id: body.id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete language expert",
      error: error
    });

  }
}