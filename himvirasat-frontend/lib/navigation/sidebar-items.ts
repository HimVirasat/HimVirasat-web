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

import {
  ADMIN_ROLES,
  isAdminRole,
  getDashboardPathForRole,
  type SystemRole,
} from "@himvirasat/shared";

export interface SidebarItem {
  [x: string]: any;
  title: string;
  url: string;
  icon: LucideIcon;
  allowedRoles: readonly SystemRole[];
  exact: true;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    allowedRoles: ADMIN_ROLES,
    exact: true,
  },
  {
    title: "Dashboard",
    url: "/user",
    icon: LayoutDashboard,
    allowedRoles: ["contributor"],
    exact: true,
  },
  {
    title: "Datasets", // <--- ADDED ITEM
    url: "/admin/datasets",
    icon: Database,
    allowedRoles: ["super_admin", "language_head"], // Restricts access to language_head & super_admin
    exact: true,
  },
  {
    title: "Language Experts",
    url: "/admin/experts",
    icon: Users,
    allowedRoles: ["super_admin", "language_head"],
    exact: true,
  },
  {
    title: "Language Heads",
    url: "/admin/heads",
    icon: Users,
    allowedRoles: ["super_admin"],
    exact: true,
  },
  {
    title: "Review Queue",
    url: "/admin/review-queue",
    icon: Check,
    allowedRoles: ADMIN_ROLES,
    exact: true,
  },
  {
    title: "Submissions",
    url: "/admin/submissions",
    icon: Send,
    allowedRoles: ADMIN_ROLES,
    exact: true,
  },
  {
    title: "Logs",
    url: "/admin/logs",
    icon: Logs,
    allowedRoles: ["super_admin", "language_head"],
    exact: true,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    allowedRoles: ADMIN_ROLES,
    exact: true,
  },
  {
    title: "Settings",
    url: "/user/settings",
    icon: Settings,
    allowedRoles: ["contributor"],
    exact: true,
  },
];

export function getSidebarItems(role: SystemRole) {
  return SIDEBAR_ITEMS.filter((item) => item.allowedRoles.includes(role));
}

export { isAdminRole, ADMIN_ROLES, getDashboardPathForRole };
