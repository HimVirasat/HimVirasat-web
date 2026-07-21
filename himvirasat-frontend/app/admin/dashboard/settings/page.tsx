"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { AdminAuthService } from "@/lib/services/admin/admin-auth-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const response = await AdminAuthService.logout();

      if (!response.success) {
        toast.error(response.message ?? "Logout failed");
        return;
      }

      // Purge the cache and immediately nullify currentUser state
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();

      toast.success("Successfully logged out");
      router.replace("/admin");
    } catch (error) {
      console.error(error);
      toast.error("Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and platform preferences.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>

            <CardDescription>
              Actions that affect your current session.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}