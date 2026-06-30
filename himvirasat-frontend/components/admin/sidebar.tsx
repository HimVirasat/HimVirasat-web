"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { LayoutDashboard, Users, Check, Send, Settings } from "lucide-react";

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
    title: "Language Heads",
    url: "/admin/dashboard/heads",
    icon: Users,
  },
  {
    title: "Review Queue",
    url: "/admin/dashboard/review-queue",
    icon: Check,
  },
  {
    title: "Submissions",
    url: "/admin/dashboard/submissions/",
    icon: Send,
  },
  {
    title: "Settings",
    url: "/admin/dashboard/settings",
    icon: Settings,
  },
];

const LANGUAGE_HEAD_ITEMS = [
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
    title: "Review Queue",
    url: "/admin/dashboard/review-queue",
    icon: Check,
  },
  {
    title: "Submissions",
    url: "/admin/dashboard/submissions/",
    icon: Send,
  },
  {
    title: "Settings",
    url: "/admin/dashboard/settings",
    icon: Settings,
  },
];

const LANGUAGE_EXPERT_ITEMS = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Review Queue",
    url: "/admin/dashboard/review-queue",
    icon: Check,
  },
  {
    title: "Submissions",
    url: "/admin/dashboard/submissions/",
    icon: Send,
  },
  {
    title: "Settings",
    url: "/admin/dashboard/settings",
    icon: Settings,
  },
];
const SIDEBAR_ITEMS = {
  super_admin: SUPER_ADMIN_ITEMS,
  language_head: LANGUAGE_HEAD_ITEMS,
  language_expert: LANGUAGE_EXPERT_ITEMS,
} as const;

const ROLE_LABELS = {
  super_admin: "Super Admin",
  language_head: "Language Head",
  language_expert: "Language Expert",
} as const;

const ROLE_BADGE_STYLES = {
  super_admin:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",

  language_head:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",

  language_expert:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
} as const;

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const items = SIDEBAR_ITEMS[user.role];
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
                  width={28}
                  height={28}
                  className="rounded-md"
                />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">HimVirasat</span>

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
            <SidebarMenuButton size="lg" tooltip={user.full_name}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                {getInitials(user.full_name)}
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.full_name}</span>

                <span className="truncate text-xs text-muted-foreground">
                  @{user.username}
                </span>
              </div>

              <Badge
                variant="secondary"
                className={cn(
                  "shrink-0 text-[10px]",
                  ROLE_BADGE_STYLES[user.role]
                )}
              >
                {ROLE_LABELS[user.role]}
              </Badge>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
