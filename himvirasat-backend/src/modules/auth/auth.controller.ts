import { Request, Response } from "express";
import * as service from "./auth.service.js";
import { LoginRequestSchema } from "@himvirasat/shared";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

export async function login(req: Request, res: Response) {
  try {
    const parseResult = LoginRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.issues[0]?.message ?? "Invalid credentials",
      });
    }
    const { username, password } = parseResult.data;
    const result = await service.loginUser(username, password);
    if (!result.success) {
      return res
        .status(result.statusCode ?? 500)
        .json({ success: false, message: result.message });
    }
    // Set cookie
    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const authUser = (req as AuthenticatedRequest).user;
    if (!authUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await service.getUserProfile(authUser.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
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
        message: "New password must be at least 6 characters",
      });
    }
    const result = await service.resetUserPassword(
      authUser.userId,
      oldPassword,
      newPassword,
    );
    if (!result.success) {
      return res
        .status(result.statusCode ?? 500)
        .json({ success: false, message: result.message });
    }
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
