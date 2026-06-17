"use client";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

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

  async function handleLogout() {
    try {
      const response = await AdminAuthService.logout();

      if (!response.success) {
        toast.error(response.message ?? "Logout failed");

        return;
      }

      toast.success("Successfully logged out");

      router.replace("/admin");
    } catch (error) {
      console.error(error);

      toast.error("Failed to logout");
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
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
