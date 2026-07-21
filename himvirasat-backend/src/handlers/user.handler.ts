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
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // 1. Fetch current username and email
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("username, email")
      .eq("id", id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const timestamp = Date.now();

    // 2. Prevent string chaining: Strip any existing prefix if it was already deleted before
    let cleanUsername = user.username;
    if (cleanUsername.startsWith("deleted_user_hv_")) {
      // Extract original username parts if possible, or just use a fallback slice
      const parts = cleanUsername.split("_");
      cleanUsername = parts[parts.length - 2] || "user"; // Grab the base handle or fallback
    }

    const anonymizedUsername = `deleted_hv_${timestamp}`;
    const anonymizedEmail = `deleted_${timestamp}_${user.email}`;

    // 3. Soft-delete and update with a short, controlled string length
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_active: false,
        username: anonymizedUsername,
        email: anonymizedEmail,
      })
      .eq("id", id);

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message || "Failed to deactivate expert",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Language expert deactivated and username freed up",
      deleted_id: id,
    });
  } catch (error) {
    console.error("Soft delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getLanguageHeads(_: Request, res: Response) {
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
        created_at
      `,
      )
      .eq("role", "language_head")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }
    const heads = data as LanguageExpertDto[];

    return res.json({
      success: true,
      heads,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch language heads",
    });
  }
}

export async function createLanguageHead(req: Request, res: Response) {
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
        role: "language_head",
        dialects,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Language head created successfully",
      head: {
        id: data.id,
        username: data.username,
        dialects: data.dialects,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create language head",
    });
  }
}

export async function deleteLanguageHead(req: Request, res: Response) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("username, email")
      .eq("id", id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const timestamp = Date.now();
    const anonymizedUsername = `deleted_hv_${timestamp}`;
    const anonymizedEmail = `deleted_${timestamp}_${user.email}`;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_active: false,
        username: anonymizedUsername,
        email: anonymizedEmail,
      })
      .eq("id", id);

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message || "Failed to deactivate language head",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Language head deactivated and username freed up",
      deleted_id: id,
    });
  } catch (error) {
    console.error("Soft delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateExpertDialects(req: Request, res: Response) {
  try {
    const { id, dialects } = req.body;

    if (!id || !Array.isArray(dialects)) {
      return res.status(400).json({
        success: false,
        message: "User ID and dialects array are required",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ dialects })
      .eq("id", id)
      .select("id, dialects")
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Expert dialects updated successfully",
      expert: data,
    });
  } catch (error) {
    console.error("Update dialects error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update dialects",
    });
  }
}

export async function updateHeadDialects(req: Request, res: Response) {
  try {
    const { id, dialects } = req.body;

    if (!id || !Array.isArray(dialects)) {
      return res.status(400).json({
        success: false,
        message: "User ID and dialects array are required",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ dialects })
      .eq("id", id)
      .select("id, dialects")
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Language head dialects updated successfully",
      head: data,
    });
  } catch (error) {
    console.error("Update head dialects error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update managed dialects",
    });
  }
}