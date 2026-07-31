"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { AuthService } from "@/lib/services/auth-service";

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
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await AuthService.me();

        if (!allowedRoles.includes(response.user.role)) {
          router.replace(fallbackPath);
          return;
        }

        setUser(response.user);
      } catch {
        router.replace("/login");
      }
    }

    loadUser();
  }, [allowedRoles, fallbackPath, router]);

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <WorkspaceShell user={user}>
      <TooltipProvider>{children}</TooltipProvider>
    </WorkspaceShell>
  );
}
