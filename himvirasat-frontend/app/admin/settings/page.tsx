"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    queryClient.setQueryData(["currentUser"], null);
    queryClient.clear();
    await signOut(() => router.replace("/"));
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your Clerk account security and active session.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            Account Security
          </CardTitle>
          <CardDescription>
            Passwords, MFA, profile details, and connected accounts are managed
            by Clerk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/user-profile">Open Profile Settings</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Session</CardTitle>
          <CardDescription>Sign out of this browser session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="lg"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full sm:w-auto"
          >
            {isLoggingOut ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                Sign out
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
