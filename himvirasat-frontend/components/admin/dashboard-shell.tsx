import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import { AdminSidebar } from "./sidebar";

import type { UserDto } from "@/types/admin/user";

import { BackgroundDecor } from "@/components/layout/background-decor";

export function DashboardShell({
  user,
  children,
}: {
  user: UserDto;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundDecor />
      <div className="relative z-10">
        <SidebarProvider>
          <AdminSidebar user={user} />

          <SidebarInset className="bg-transparent">{children}</SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
