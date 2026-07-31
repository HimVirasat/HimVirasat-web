import {
  Check,
  Database, // <--- Add Database icon from lucide-react
  LayoutDashboard,
  Logs,
  Send,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { SystemRole } from "@himvirasat/shared";

export interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
  allowedRoles: SystemRole[];
}

export const ADMIN_ROLES: SystemRole[] = [
  "super_admin",
  "language_head",
  "language_expert",
];

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ADMIN_ROLES,
  },
  {
    title: "Dashboard",
    url: "/user/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["contributor"],
  },
  {
    title: "Datasets", // <--- ADDED ITEM
    url: "/admin/dashboard/datasets",
    icon: Database,
    allowedRoles: ["super_admin", "language_head"], // Restricts access to language_head & super_admin
  },
  {
    title: "Language Experts",
    url: "/admin/dashboard/experts",
    icon: Users,
    allowedRoles: ["super_admin", "language_head"],
  },
  {
    title: "Language Heads",
    url: "/admin/dashboard/heads",
    icon: Users,
    allowedRoles: ["super_admin"],
  },
  {
    title: "Review Queue",
    url: "/admin/dashboard/review-queue",
    icon: Check,
    allowedRoles: ADMIN_ROLES,
  },
  {
    title: "Submissions",
    url: "/admin/dashboard/submissions",
    icon: Send,
    allowedRoles: ADMIN_ROLES,
  },
  {
    title: "My Submissions",
    url: "/user/dashboard/submissions",
    icon: Send,
    allowedRoles: ["contributor"],
  },
  {
    title: "Logs",
    url: "/admin/dashboard/logs",
    icon: Logs,
    allowedRoles: ["super_admin", "language_head"],
  },
  {
    title: "Settings",
    url: "/admin/dashboard/settings",
    icon: Settings,
    allowedRoles: ADMIN_ROLES,
  },
];

export function getSidebarItems(role: SystemRole) {
  return SIDEBAR_ITEMS.filter((item) => item.allowedRoles.includes(role));
}

export function isAdminRole(role: SystemRole) {
  return ADMIN_ROLES.includes(role);
}