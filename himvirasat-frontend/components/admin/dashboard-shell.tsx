import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AdminSidebar } from "./sidebar";

import type { UserDto } from "@himvirasat/shared";

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
        <SidebarProvider defaultOpen={true}>
          <AdminSidebar user={user} />

          <SidebarInset className="bg-transparent">
            <header className="sticky top-0 z-20 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur">
              <SidebarTrigger />
            </header>

            <main>{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
