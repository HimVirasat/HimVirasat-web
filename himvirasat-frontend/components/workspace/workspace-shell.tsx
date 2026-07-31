import { BackgroundDecor } from "@/components/layout/background-decor";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/workspace/app-sidebar";

import type { UserDto } from "@himvirasat/shared";

export function WorkspaceShell({
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
          <AppSidebar user={user} />

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
