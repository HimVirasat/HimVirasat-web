"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Award,
  CheckCircle2,
  FileCheck,
  Globe,
  Mail,
  Shield,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { DashboardToolbar } from "@/components/admin/dashboard-toolbar";
import { DashboardService } from "@/lib/services/admin/dashboard-service";

export default function DashboardPage() {
  const {
    data: profile,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["my-profile"],
    queryFn: DashboardService.getMyProfile,
  });

  const formatRole = (role?: string) => {
    if (!role) return "User";
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <DashboardToolbar
          refreshing={isRefetching}
          onRefresh={() => refetch()}
        />

        <p className="text-muted-foreground">
          Welcome back to the HimVirasat platform.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
                      <Badge variant="outline" className="capitalize">
                        <Shield className="mr-1 h-3 w-3 text-primary" />
                        {formatRole(profile?.role)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      @{profile?.userName}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 border-t pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>
                {isLoading ? <Skeleton className="h-4 w-40" /> : profile?.email}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Dialects:</span>
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : profile?.dialects && profile.dialects.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {profile.dialects.map((dialect) => (
                    <Badge key={dialect} variant="secondary" className="text-xs">
                      {dialect}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs italic">None specified</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats Grid */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold">Your Contribution Stats</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Award className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  profile?.stats?.totalPoints ?? 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Earned through contributions and reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Entries</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  profile?.stats?.approvedEntriesCount ?? 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Validated submissions accepted to the platform
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reviews Completed
              </CardTitle>
              <FileCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  profile?.stats?.reviewsCompletedCount ?? 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Total dialect entries evaluated
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}