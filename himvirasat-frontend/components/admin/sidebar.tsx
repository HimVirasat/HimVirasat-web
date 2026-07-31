"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getSidebarItems } from "@/lib/navigation/sidebar-items";

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

import type { UserDto } from "@himvirasat/shared";

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

const ROLE_LABELS = {
  super_admin: "Super Admin",
  language_head: "Language Head",
  language_expert: "Language Expert",
  contributor: "Contributor",
} as const;

const ROLE_BADGE_STYLES = {
  super_admin:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",

  language_head:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",

  language_expert:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",

  contributor:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
} as const;

const PRODUCT_AREAS = {
  super_admin: "Super Admin Console",
  language_head: "Language Head Console",
  language_expert: "Language Expert Console",
  contributor: "Contributor Workspace",
} as const;

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const items = getSidebarItems(user.role);
  const productArea = PRODUCT_AREAS[user.role];
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
                  {productArea}
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
                      isActive={
                        pathname === item.url ||
                        (item.url !== "/" &&
                          pathname.startsWith(`${item.url}/`))
                      }
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
