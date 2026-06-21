"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  FileText,
  Database,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { UserDto } from "@/types/admin/user";

interface AdminSidebarProps {
  user: UserDto;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const SUPER_ADMIN_ITEMS = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Language Experts",
    url: "/admin/dashboard/experts",
    icon: Users,
  },
  {
    title: "Contributions",
    url: "/admin/dashboard/contributions",
    icon: FileText,
  },
  {
    title: "Datasets",
    url: "/admin/dashboard/datasets",
    icon: Database,
  },
  {
    title: "Settings",
    url: "/admin/dashboard/settings",
    icon: Settings,
  },
];

const EXPERT_ITEMS = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Contributions",
    url: "/admin/dashboard/contributions",
    icon: FileText,
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const isSuperAdmin = user.role === "super_admin";

  const items = isSuperAdmin
    ? SUPER_ADMIN_ITEMS
    : EXPERT_ITEMS;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Header */}
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary">
                <Image
                  src="/virasat.png"
                  alt="HimVirasat"
                  width={24}
                  height={24}
                  className="rounded-md"
                />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  HimVirasat
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  Admin Console
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={user.full_name}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                {getInitials(user.full_name)}
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user.full_name}
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  @{user.username}
                </span>
              </div>

              <Badge
                variant="secondary"
                className={cn(
                  "shrink-0 text-[10px]",
                  isSuperAdmin
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                )}
              >
                {isSuperAdmin ? "Admin" : "Expert"}
              </Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}