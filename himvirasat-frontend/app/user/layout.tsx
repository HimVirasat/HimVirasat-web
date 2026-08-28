"use client";

import { WorkspaceAuthLayout } from "@/components/workspace/workspace-auth-layout";
import { CONTRIBUTOR_ROLE } from "@himvirasat/shared";

const CONTRIBUTOR_ROLES = [CONTRIBUTOR_ROLE] as const;

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceAuthLayout allowedRoles={CONTRIBUTOR_ROLES} fallbackPath="/admin">
      {children}
    </WorkspaceAuthLayout>
  );
}
