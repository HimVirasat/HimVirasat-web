"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  Database,
  Settings,
  ChevronRight,
  Languages,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { UserDto } from "@/types/admin/user";

interface AdminSidebarProps {
  user: UserDto;
}
import Image from "next/image";
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const SUPER_ADMIN_ITEMS = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Language Experts", url: "/admin/dashboard/experts", icon: Users },
  { title: "Contributions", url: "/admin/dashboard/contributions", icon: FileText },
  { title: "Datasets", url: "/admin/dashboard/datasets", icon: Database },
  { title: "Settings", url: "/admin/dashboard/settings", icon: Settings },
];

const EXPERT_ITEMS = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Contributions", url: "/admin/dashboard/contributions", icon: FileText },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = user.role === "super_admin";
  const items = isSuperAdmin ? SUPER_ADMIN_ITEMS : EXPERT_ITEMS;

  return (
    <Sidebar>
      {/* ── Brand Header ── */}
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
            {/* <Languages className="h-5 w-5 text-primary-foreground" /> */}
            <Image src={"/virasat.png"} height={36} width={36} className="rounded-md" alt="_" ></Image>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">HimVirasat</p>
            <p className="text-[11px] text-muted-foreground">Admin Console</p>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Nav Items ── */}
      <SidebarContent>
        <SidebarGroup className="mt-3 px-2">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </p>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "group h-10 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon
                          className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110"
                        />
                        <span className="flex-1">{item.title}</span>
                        {isActive && (
                          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User Footer Card ── */}
      <SidebarFooter className="border-t p-3">
        <div className="rounded-xl border bg-linear-to-br from-muted/70 to-muted/30 p-3 backdrop-blur-sm">
          {/* Avatar row */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm ring-2 ring-background">
              {getInitials(user.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-snug">
                {user.full_name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </div>

          {/* Role badge */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className={cn(
                "h-5 rounded-md px-1.5 text-[10px] font-semibold",
                isSuperAdmin
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
              )}
            >
              {isSuperAdmin ? "Super Admin" : "Language Expert"}
            </Badge>

            {user.dialects.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                · {user.dialects.length} dialect
                {user.dialects.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Dialect chips */}
          {user.dialects.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {user.dialects.slice(0, 3).map((dialect) => (
                <span
                  key={dialect}
                  className="rounded-full border bg-background/60 px-2 py-0.5 text-[10px] font-medium text-foreground/70"
                >
                  {dialect}
                </span>
              ))}
              {user.dialects.length > 3 && (
                <span className="rounded-full border bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  +{user.dialects.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}