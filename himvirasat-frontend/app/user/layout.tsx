"use client";

import { WorkspaceAuthLayout } from "@/components/workspace/workspace-auth-layout";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceAuthLayout allowedRoles={["contributor"]} fallbackPath="/admin">
      {children}
    </WorkspaceAuthLayout>
  );
}
