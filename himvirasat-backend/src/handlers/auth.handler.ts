import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { generateToken } from "../utils/jwt.js";
import { supabase } from "../services/supabase.js";

import type { LoginRequest, LoginResponse, User } from "../types/auth.types.js";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export async function login(req: Request, res: Response) {
  try {
    const body = req.body as LoginRequest;

    const { username, password } = body;

    if (!username || !password) {
      const response: LoginResponse = {
        success: false,
        message: "Username and password are required",
      };

      return res.status(400).json(response);
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      const response: LoginResponse = {
        success: false,
        message: "Invalid credentials",
      };

      return res.status(401).json(response);
    }

    const user = data as User;

    if (!user.is_active) {
      const response: LoginResponse = {
        success: false,
        message: "Account is disabled",
      };

      return res.status(403).json(response);
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      const response: LoginResponse = {
        success: false,
        message: "Invalid credentials",
      };

      return res.status(401).json(response);
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const response: LoginResponse = {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        dialects: user.dialects,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);

    const response: LoginResponse = {
      success: false,
      message: "Internal server error",
    };

    return res.status(500).json(response);
  }
}

export async function me(req: Request, res: Response) {
  try {
    const authUser = (req as AuthenticatedRequest).user;

    if (!authUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.userId)
      .single();

    if (error || !data) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = data as User;

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        dialects: user.dialects,
      },
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
}
export async function resetPassword(req: Request, res: Response) {
  try {
    const authUser = (req as AuthenticatedRequest).user;

    if (!authUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = authUser.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Fetch user with password hash
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("id", userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password_hash,
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: newPasswordHash })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while resetting password",
    });
  }
}
