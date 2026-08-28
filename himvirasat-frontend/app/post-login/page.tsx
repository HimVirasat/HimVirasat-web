"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { AuthService } from "@/lib/services/auth-service";
import {
  getDashboardPathForRole,
  coerceSystemRole,
  type SystemRole,
} from "@himvirasat/shared";

function roleFromClerkMetadata(user: {
  publicMetadata?: Record<string, unknown> | undefined;
}): SystemRole | null {
  const candidates: unknown[] = [
    user.publicMetadata?.himvirasatRole,
    user.publicMetadata?.role,
    // Nested metadata fallbacks (in case claims are nested differently)
    (user.publicMetadata as Record<string, any> | undefined)?.rbac?.role,
  ];

  for (const candidate of candidates) {
    if (candidate != null) {
      return coerceSystemRole(candidate);
    }
  }

  return null;
}

export default function PostLoginPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const routed = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    // If we are not signed in, send to sign-in (but never back to a bounce loop).
    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    if (routed.current) return;

    let cancelled = false;

    async function routeByRole() {
      // 1. Authoritative source: the RBAC profile from our backend (DB role).
      try {
        const response = await AuthService.me();
        if (cancelled) return;
        const role = response.user?.role;
        routed.current = true;
        router.replace(getDashboardPathForRole(role ?? null));
        return;
      } catch {
        // Backend is unreachable or user row not synced yet.
        if (cancelled) return;
      }

      // 2. Fallback: read the role currently known to Clerk (publicMetadata).
      const clerkRole = user ? roleFromClerkMetadata(user) : null;
      // New sign-ups default to contributor until an admin promotes them.
      routed.current = true;
      router.replace(getDashboardPathForRole(clerkRole ?? "contributor"));
    }

    routeByRole();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 bg-background">
      <div className="animate-pulse text-sm text-muted-foreground">
        Preparing your workspace...
      </div>
    </main>
  );
}
