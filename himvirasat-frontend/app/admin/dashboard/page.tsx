"use client";

import { useQuery } from "@tanstack/react-query";
import { Shield, Users, UserCog } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DashboardService } from "@/lib/services/admin/dashboard-service";
import { DashboardToolbar } from "@/components/admin/dashboard-toolbar";
export default function DashboardPage() {
  const {
    data: stats,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: DashboardService.getStats,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <DashboardToolbar
          refreshing={isRefetching}
          onRefresh={() => refetch()}
        />

        <p className="text-muted-foreground">
          Overview of the HimVirasat moderation platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Language Experts
            </CardTitle>

            <Users className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : (stats?.languageExpertsCount ?? 0)}
            </div>

            <p className="text-xs text-muted-foreground">
              Active reviewers on the platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Language Heads
            </CardTitle>

            <UserCog className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : (stats?.languageHeadsCount ?? 0)}
            </div>

            <p className="text-xs text-muted-foreground">
              Managing language experts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>

            <Shield className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : (stats?.superAdminsCount ?? 0)}
            </div>

            <p className="text-xs text-muted-foreground">
              Platform administrators
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
