"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, KeyRound, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminAuthService } from "@/lib/services/admin/admin-auth-service";
import {
  staticPrimaryButtonStyles,
  staticSecondaryButtonStyles,
  subtlePrimaryButtonStyles,
} from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Password reset states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // --- Logout handler ---
  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const response = await AdminAuthService.logout();

      if (!response.success) {
        toast.error(response.message ?? "Logout failed", {
          description: "Please try again or contact support.",
        });
        return;
      }

      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();

      toast.success("Logged out successfully", {
        description: "You have been signed out of your account.",
      });
      router.replace("/admin");
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred", {
        description: "We could not complete your logout request.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  }

  // --- Password reset handler ---
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    // Basic validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required", {
        description: "Please fill in your current and new passwords.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Your new password and confirmation must be identical.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password too short", {
        description: "New password must be at least 6 characters long.",
      });
      return;
    }

    setIsResetting(true);
    try {
      const response = await AdminAuthService.resetPassword(
        oldPassword,
        newPassword
      );

      if (response.success) {
        toast.success("Password updated successfully", {
          description:
            "Your password has been changed. Please use it next time you log in.",
        });
        // Clear form
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.message ?? "Failed to reset password", {
          description: "Please verify your current password and try again.",
        });
      }
    } catch (error: any) {
      toast.error(error.message ?? "An error occurred", {
        description: "We could not update your password at this time.",
      });
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account security and session preferences.
        </p>
      </div>

      {/* Password Reset Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <KeyRound className="size-5 text-primary" aria-hidden="true" />
            Reset Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
                disabled={isResetting}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={isResetting}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re‑enter your new password"
                disabled={isResetting}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isResetting}
              size="lg"
              className={subtlePrimaryButtonStyles + " min-w-40 mt-4"}
            >
              {isResetting ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Updating…
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your current session.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            variant="destructive"
            size="lg"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full sm:w-auto hover:bg-red-500"
          >
            {isLoggingOut ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Logging out…
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                Logout
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            You will be redirected to the login page after logging out.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
