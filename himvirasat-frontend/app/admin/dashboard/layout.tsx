"use client";

import { WorkspaceAuthLayout } from "@/components/workspace/workspace-auth-layout";
import { ADMIN_ROLES } from "@/lib/navigation/sidebar-items";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceAuthLayout
      allowedRoles={ADMIN_ROLES}
      fallbackPath="/user/dashboard"
    >
      {children}
    </WorkspaceAuthLayout>
  );
}
