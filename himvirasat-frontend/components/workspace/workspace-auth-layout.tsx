"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { AuthService } from "@/lib/services/auth-service";
import { Skeleton } from "@/components/ui/skeleton";

import type { SystemRole, UserDto } from "@himvirasat/shared";

interface WorkspaceAuthLayoutProps {
  allowedRoles: readonly SystemRole[];
  fallbackPath: string;
  children: React.ReactNode;
}

export function WorkspaceAuthLayout({
  allowedRoles,
  fallbackPath,
  children,
}: WorkspaceAuthLayoutProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function loadUser() {
      try {
        const response = await AuthService.me();
        if (cancelled) return;

        if (!allowedRoles.includes(response.user.role)) {
          router.replace(fallbackPath);
          return;
        }

        setUser(response.user);
      } catch {
        // A signed-in user whose profile can't be loaded should not be sent back
        // to /login (that would cause a redirect loop). Send them home instead
        // where the navbar/post-login flow can recover.
        if (!cancelled && isSignedIn) {
          router.replace("/");
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [allowedRoles, fallbackPath, isLoaded, isSignedIn, router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex w-full max-w-md flex-col items-center gap-6 px-6">
          <Image
            src="/virasat.png"
            alt="HimVirasat"
            width={56}
            height={56}
            className="animate-pulse rounded-xl"
          />
          <div className="w-full space-y-3">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
            <Skeleton className="h-4 w-2/3 rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceShell user={user}>
      <TooltipProvider>{children}</TooltipProvider>
    </WorkspaceShell>
  );
}
