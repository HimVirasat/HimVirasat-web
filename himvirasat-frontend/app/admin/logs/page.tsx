"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Activity,
  AlertOctagon,
  Filter,
  RefreshCw,
  Check,
  Code2,
  Loader2,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Server,
  FileJson,
  ExternalLink,
  Info,
  Copy,
  Terminal,
  Fingerprint,
  Calendar as CalendarIcon,
  Clock,
  ArrowUpDown,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  DataLookupService,
  PaginatedLogsResponse,
} from "@/lib/services/admin/datalookup-service";
import {
  ActivityLog,
  ErrorLog,
  BACKEND_MODULE_CATEGORIES,
  LOG_STATUS,
} from "@himvirasat/shared";

const isErrorLog = (log: ActivityLog | ErrorLog): log is ErrorLog => {
  return "error_message" in log;
};

const SERVICE_COLOR_MAP: Record<
  BACKEND_MODULE_CATEGORIES,
  { bg: string; text: string; border: string; badge: string }
> = {
  auth: {
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/30",
    badge:
      "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  },
  dashboard: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  },
  datalookup: {
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/30",
    badge: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  },
  review_queue: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    badge:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  submissions: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
    badge:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  },
  users: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/30",
    badge:
      "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  },
  datasets: {
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  },
};

const SERVICE_CATEGORIES: {
  label: string;
  value: BACKEND_MODULE_CATEGORIES | "ALL";
}[] = [
    { label: "All Services", value: "ALL" },
    { label: "Auth", value: "auth" },
    { label: "Dashboard", value: "dashboard" },
    { label: "Data Lookup", value: "datalookup" },
    { label: "Review Queue", value: "review_queue" },
    { label: "Submissions", value: "submissions" },
    { label: "Users", value: "users" },
    { label: "Datasets", value: "datasets" },
  ];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: `${String(i).padStart(2, "0")}:00 - ${String(i).padStart(2, "0")}:59`,
}));

export default function LogsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"activity" | "error">("activity");
  const [selectedService, setSelectedService] = useState<
    BACKEND_MODULE_CATEGORIES | "ALL"
  >("ALL");
  const [statusFilter, setStatusFilter] = useState<LOG_STATUS | "ALL">("ALL");

  // Date, Hour & Sort Filtering State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [isLiveTail, setIsLiveTail] = useState(false);
  const [copied, setCopied] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedLog, setSelectedLog] = useState<ActivityLog | ErrorLog | null>(
    null
  );
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Compute ISO timestamps for selected date & hour
  const { startDate, endDate } = useMemo(() => {
    if (!selectedDate) return { startDate: undefined, endDate: undefined };

    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (selectedHour !== "ALL") {
      const h = Number(selectedHour);
      start.setHours(h, 0, 0, 0);
      end.setHours(h, 59, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [selectedDate, selectedHour]);

  // Activity Query
  const {
    data: activityResponse,
    isLoading: isLoadingActivity,
    refetch: refetchActivity,
    isFetching: isFetchingActivity,
  } = useQuery<PaginatedLogsResponse<ActivityLog>>({
    queryKey: [
      "activity-logs",
      selectedService,
      statusFilter,
      startDate,
      endDate,
      sortOrder,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      DataLookupService.getActivityLogs({
        service: selectedService !== "ALL" ? selectedService : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        startDate,
        endDate,
        sort: sortOrder,
        page: currentPage,
        limit: pageSize,
      }),
    enabled: activeTab === "activity",
    refetchInterval: isLiveTail ? 5000 : false,
  });

  // Error Query
  const {
    data: errorResponse,
    isLoading: isLoadingError,
    refetch: refetchError,
    isFetching: isFetchingError,
  } = useQuery<PaginatedLogsResponse<ErrorLog>>({
    queryKey: [
      "error-logs",
      selectedService,
      statusFilter,
      startDate,
      endDate,
      sortOrder,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      DataLookupService.getErrorLogs({
        service: selectedService !== "ALL" ? selectedService : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        startDate,
        endDate,
        sort: sortOrder,
        page: currentPage,
        limit: pageSize,
      }),
    enabled: activeTab === "error",
    refetchInterval: isLiveTail ? 5000 : false,
  });

  const isLoading =
    activeTab === "activity" ? isLoadingActivity : isLoadingError;
  const isFetching =
    activeTab === "activity" ? isFetchingActivity : isFetchingError;

  const activityLogs = useMemo(
    () => activityResponse?.data || [],
    [activityResponse]
  );
  const errorLogs = useMemo(() => errorResponse?.data || [], [errorResponse]);

  const activeDataset = activeTab === "activity" ? activityLogs : errorLogs;

  const metrics = useMemo(() => {
    if (activeTab === "activity") {
      const meta = activityResponse?.meta;
      return {
        total: meta?.total ?? activityLogs.length,
        success: meta?.totalSuccess ?? 0,
        failed: meta?.totalFailed ?? 0,
        critical: 0,
        standard: 0,
      };
    } else {
      const meta = errorResponse?.meta;
      return {
        total: meta?.total ?? errorLogs.length,
        success: 0,
        failed: 0,
        critical: meta?.totalCritical ?? 0,
        standard: meta?.totalStandard ?? 0,
      };
    }
  }, [activeTab, activityResponse, errorResponse, activityLogs, errorLogs]);

  const hasNextPage = useMemo(() => {
    const totalPages =
      activeTab === "activity"
        ? activityResponse?.meta?.totalPages
        : errorResponse?.meta?.totalPages;

    if (totalPages) {
      return currentPage < totalPages;
    }
    return activeDataset.length === pageSize;
  }, [
    activeTab,
    activityResponse,
    errorResponse,
    currentPage,
    activeDataset,
    pageSize,
  ]);

  const handleCopyJson = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    if (activeTab === "activity") refetchActivity();
    else refetchError();
  };

  const handleOpenLog = (log: ActivityLog | ErrorLog) => {
    setSelectedLog(log);
    setIsInspectorOpen(true);
  };

  const handleClearDateFilters = () => {
    setSelectedDate(undefined);
    setSelectedHour("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6 bg-card/60 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Button
            variant={isLiveTail ? "default" : "outline"}
            size="sm"
            className="h-8 gap-2 text-xs font-mono"
            onClick={() => setIsLiveTail((prev) => !prev)}
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                (isFetching || isLiveTail) && "animate-spin"
              )}
            />
            <span className="hidden sm:inline">
              {isLiveTail ? "Live Tail: Active (5s)" : "Live Tail: Paused"}
            </span>
            <span className="inline sm:hidden">
              {isLiveTail ? "Live" : "Paused"}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={handleRefresh}
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span>Sync</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col min-h-0 overflow-hidden p-3 md:p-6 gap-3 md:gap-4 bg-muted/20">
        {/* Metrics Grid */}
        <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="bg-card/70 border-border/60 shadow-xs">
            <CardContent className="p-3.5 md:p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  {activeTab === "activity"
                    ? "Total Logged Events"
                    : "Total Exceptions"}
                </p>
                <p className="text-xl md:text-2xl font-bold font-mono tracking-tight mt-1">
                  {metrics.total.toLocaleString()}
                </p>
              </div>
              <div className="flex size-9 md:size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Layers className="size-4 md:size-5" />
              </div>
            </CardContent>
          </Card>

          {activeTab === "activity" ? (
            <>
              <Card className="bg-card/70 border-border/60 shadow-xs">
                <CardContent className="p-3.5 md:p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                      Total Successful Ops
                    </p>
                    <p className="text-xl md:text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                      {metrics.success.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex size-9 md:size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-4 md:size-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/70 border-border/60 shadow-xs">
                <CardContent className="p-3.5 md:p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider font-mono">
                      Total Failed Attempts
                    </p>
                    <p className="text-xl md:text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 mt-1">
                      {metrics.failed.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex size-9 md:size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="size-4 md:size-5" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="bg-card/70 border-border/60 shadow-xs">
                <CardContent className="p-3.5 md:p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-destructive uppercase tracking-wider font-mono">
                      Total Critical (5xx)
                    </p>
                    <p className="text-xl md:text-2xl font-bold font-mono tracking-tight text-destructive mt-1">
                      {metrics.critical.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex size-9 md:size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <AlertOctagon className="size-4 md:size-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/70 border-border/60 shadow-xs">
                <CardContent className="p-3.5 md:p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono">
                      Total Standard Errors
                    </p>
                    <p className="text-xl md:text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 mt-1">
                      {metrics.standard.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex size-9 md:size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Code2 className="size-4 md:size-5" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters and Search Bar */}
        <div className="flex shrink-0 flex-col gap-2 rounded-xl border bg-card p-2.5 sm:p-3 shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as "activity" | "error");
                setCurrentPage(1);
              }}
              className="w-full lg:w-auto"
            >
              <TabsList className="grid w-full sm:w-64 grid-cols-2">
                <TabsTrigger
                  value="activity"
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Activity className="size-3.5" /> Activity
                </TabsTrigger>
                <TabsTrigger
                  value="error"
                  className="gap-1.5 text-xs font-semibold"
                >
                  <AlertOctagon className="size-3.5" /> Exceptions
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
              {/* Date Calendar Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 justify-start text-xs font-normal bg-background",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1.5 size-3.5 shrink-0" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setCurrentPage(1);
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* Hour Filter */}
              <Select
                value={selectedHour}
                disabled={!selectedDate}
                onValueChange={(val) => {
                  setSelectedHour(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 min-w-0 sm:min-w-36 text-xs bg-background">
                  <Clock className="mr-1.5 size-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="All Hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">
                    All Hours (00:00 - 23:59)
                  </SelectItem>
                  {HOURS.map((h) => (
                    <SelectItem
                      key={h.value}
                      value={h.value}
                      className="text-xs font-mono"
                    >
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Service Filter */}
              <Select
                value={selectedService}
                onValueChange={(val) => {
                  setSelectedService(val as BACKEND_MODULE_CATEGORIES | "ALL");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 min-w-0 sm:min-w-36 text-xs bg-background">
                  <Layers className="mr-1.5 size-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Service Category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className="text-xs"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val as LOG_STATUS | "ALL");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 min-w-0 sm:min-w-32 text-xs bg-background">
                  <Filter className="mr-1.5 size-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="SUCCESS" className="text-xs">
                    SUCCESS
                  </SelectItem>
                  <SelectItem value="FAILED" className="text-xs">
                    FAILED
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs font-mono bg-background"
                onClick={() => {
                  setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
                  setCurrentPage(1);
                }}
              >
                <ArrowUpDown className="size-3.5 text-muted-foreground" />
                <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
              </Button>

              {/* Clear Date Filters Action */}
              {(selectedDate || selectedHour !== "ALL") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  onClick={handleClearDateFilters}
                >
                  <X className="size-3.5" />
                  Clear Date
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Log Table Container */}
        <div className="flex flex-1 flex-col min-h-0 rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="relative flex-1 min-h-0 overflow-auto">
            {isLoading ? (
              <div className="flex h-full min-h-48 items-center justify-center text-xs text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                Retrieving telemetry logs...
              </div>
            ) : activeDataset.length === 0 ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground p-6">
                <Info className="size-8 text-muted-foreground/50" />
                <p className="font-semibold">No telemetry log entries found</p>
                <p className="text-[11px]">
                  Try adjusting your filters or date selection.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="block md:hidden divide-y divide-border/60">
                  {activeTab === "activity"
                    ? (activeDataset as ActivityLog[]).map((log) => {
                      const colors = SERVICE_COLOR_MAP[log.service_category];
                      return (
                        <div
                          key={log.id}
                          onClick={() => handleOpenLog(log)}
                          className="p-3.5 space-y-2 cursor-pointer active:bg-muted/60 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-mono text-[10px] uppercase border",
                                colors?.badge
                              )}
                            >
                              {log.service_category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {log.action}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[9px] font-bold border-0 shrink-0",
                                log.status === "SUCCESS"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              )}
                            >
                              {log.status}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                            <span>
                              Actor:{" "}
                              {log.actor_id
                                ? log.actor_id.slice(0, 8) + "..."
                                : "System"}
                            </span>
                            <span>Target: {log.entity_type}</span>
                          </div>
                        </div>
                      );
                    })
                    : (activeDataset as ErrorLog[]).map((log) => {
                      const colors = SERVICE_COLOR_MAP[log.service_category];
                      return (
                        <div
                          key={log.id}
                          onClick={() => handleOpenLog(log)}
                          className="p-3.5 space-y-2 cursor-pointer active:bg-muted/60 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="destructive"
                                className="text-[10px] font-mono font-bold"
                              >
                                {log.code || "500"}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-mono text-[10px] uppercase border",
                                  colors?.badge
                                )}
                              >
                                {log.service_category}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-xs font-mono font-semibold text-foreground truncate">
                            {log.method || "N/A"} {log.path || "/"}
                          </p>

                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {log.error_message}
                          </p>
                        </div>
                      );
                    })}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                  {activeTab === "activity" ? (
                    <Table>
                      <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-xs">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-40 text-[11px] font-mono">
                            TIMESTAMP
                          </TableHead>
                          <TableHead className="text-[11px] font-mono">
                            ACTION / EVENT
                          </TableHead>
                          <TableHead className="text-[11px] font-mono">
                            SERVICE
                          </TableHead>
                          <TableHead className="text-[11px] font-mono">
                            ACTOR ID
                          </TableHead>
                          <TableHead className="w-56 text-[11px] font-mono">
                            ENTITY TARGET
                          </TableHead>
                          <TableHead className="w-20 text-[11px] font-mono">
                            STATUS
                          </TableHead>
                          <TableHead className="w-12 text-right text-[11px] font-mono">
                            INSPECT
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-mono text-xs">
                        {(activeDataset as ActivityLog[]).map((log) => {
                          const colors = SERVICE_COLOR_MAP[log.service_category];
                          return (
                            <TableRow
                              key={log.id}
                              onClick={() => handleOpenLog(log)}
                              className="cursor-pointer transition-colors hover:bg-muted/60"
                            >
                              <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell className="font-bold text-foreground">
                                <Badge
                                  variant="outline"
                                  className="font-mono text-[10px] bg-primary/5 text-primary border-primary/20"
                                >
                                  {log.action}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] uppercase font-mono border",
                                    colors?.badge
                                  )}
                                >
                                  {log.service_category}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-sans font-medium text-foreground max-w-40">
                                <span className="font-mono text-xs font-semibold truncate block">
                                  {log.actor_id || "System"}
                                </span>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {log.entity_type}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-[9px] font-bold border-0",
                                    log.status === "SUCCESS"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  )}
                                >
                                  {log.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                >
                                  <ExternalLink className="size-3.5 text-muted-foreground" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <Table>
                      <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-xs">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-40 text-[11px] font-mono">
                            TIMESTAMP
                          </TableHead>
                          <TableHead className="text-[11px] font-mono">
                            ERROR CODE
                          </TableHead>
                          <TableHead className="text-[11px] font-mono">
                            SERVICE
                          </TableHead>
                          <TableHead className="text-[11px] font-mono">
                            HTTP ROUTE
                          </TableHead>
                          <TableHead className="text-[11px] font-mono">
                            MESSAGE EXCEPTION
                          </TableHead>
                          <TableHead className="text-[11px] font-mono">
                            USER ID
                          </TableHead>
                          <TableHead className="w-12 text-right text-[11px] font-mono">
                            INSPECT
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="font-mono text-xs">
                        {(activeDataset as ErrorLog[]).map((log) => {
                          const colors = SERVICE_COLOR_MAP[log.service_category];
                          return (
                            <TableRow
                              key={log.id}
                              onClick={() => handleOpenLog(log)}
                              className="cursor-pointer transition-colors hover:bg-muted/60"
                            >
                              <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] font-mono font-bold"
                                >
                                  {log.code || "500"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] uppercase font-mono border",
                                    colors?.badge
                                  )}
                                >
                                  {log.service_category}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-foreground">
                                {log.method || "N/A"} {log.path || "/"}
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-muted-foreground font-sans">
                                {log.error_message}
                              </TableCell>
                              <TableCell className="font-sans font-medium truncate max-w-28 text-muted-foreground">
                                {log.user_id || "Anonymous"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                >
                                  <ExternalLink className="size-3.5 text-muted-foreground" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Pagination Controls */}
          <div className="flex shrink-0 items-center justify-between border-t px-3 md:px-4 py-2.5 bg-card text-xs">
            <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground font-mono">
              <span className="hidden sm:inline">Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-14 md:w-16 text-xs bg-background">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-muted-foreground font-mono text-[11px] md:text-xs">
                Page {currentPage} of{" "}
                {activeTab === "activity"
                  ? activityResponse?.meta?.totalPages || 1
                  : errorResponse?.meta?.totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={currentPage === 1 || isFetching}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={!hasNextPage || isFetching}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Inspector Sheet */}
      <Sheet open={isInspectorOpen} onOpenChange={setIsInspectorOpen}>
        <SheetContent className="sm:max-w-2xl w-full flex flex-col p-0 gap-0 bg-background overflow-hidden border-l border-border">
          {selectedLog && (
            <>
              <SheetHeader className="p-4 md:p-6 border-b bg-muted/20 shrink-0">
                <div className="flex items-center justify-between pr-6">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[10px] uppercase border",
                      SERVICE_COLOR_MAP[selectedLog.service_category]?.badge
                    )}
                  >
                    {selectedLog.service_category}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs font-mono"
                    onClick={() => handleCopyJson(selectedLog)}
                  >
                    {copied ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    Copy JSON
                  </Button>
                </div>
                <SheetTitle className="text-sm md:text-base font-bold font-mono tracking-tight mt-2 text-foreground break-all">
                  {isErrorLog(selectedLog)
                    ? selectedLog.error_message
                    : selectedLog.action}
                </SheetTitle>
                <SheetDescription className="text-[11px] md:text-xs font-mono text-muted-foreground break-all">
                  ID: {selectedLog.id} •{" "}
                  {new Date(selectedLog.created_at).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 md:p-6 space-y-5 md:space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                      <Server className="size-3.5" /> Overview Attributes
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="rounded-lg border border-border/60 p-3 bg-card shadow-sm">
                        <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                          <Activity className="size-3" /> Status & Action
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              selectedLog.status === "SUCCESS"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            )}
                          />
                          <span className="font-bold">
                            {selectedLog.status}
                          </span>
                        </div>
                        <p className="mt-1 font-semibold text-muted-foreground truncate">
                          {selectedLog.action}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border/60 p-3 bg-card shadow-sm">
                        <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                          <Terminal className="size-3" /> Backend Code mapping
                        </p>
                        <Badge
                          variant="secondary"
                          className="mt-2 text-[10px] break-all"
                        >
                          {selectedLog.backend_code}
                        </Badge>
                      </div>

                      <div className="rounded-lg border border-border/60 p-3 bg-card shadow-sm sm:col-span-2">
                        <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                          <Fingerprint className="size-3" /> Trigger Actor /
                          Target
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-muted-foreground block mb-0.5">
                              Actor ID
                            </span>
                            <span className="font-semibold break-all">
                              {isErrorLog(selectedLog)
                                ? selectedLog.user_id || "System / Anonymous"
                                : selectedLog.actor_id || "System / Anonymous"}
                            </span>
                          </div>
                          {!isErrorLog(selectedLog) && (
                            <div>
                              <span className="text-[10px] text-muted-foreground block mb-0.5">
                                Entity Type Target
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {selectedLog.entity_type}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isErrorLog(selectedLog) && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 font-mono flex items-center gap-1.5">
                        <AlertOctagon className="size-3.5" /> Exception Context
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div className="rounded-lg border border-border/60 p-3 bg-card shadow-sm">
                          <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                            Status Code
                          </span>
                          <span className="font-bold text-destructive">
                            {selectedLog.code}
                          </span>
                        </div>
                        <div className="rounded-lg border border-border/60 p-3 bg-card shadow-sm sm:col-span-2">
                          <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                            HTTP Route Execution
                          </span>
                          <span className="font-bold break-all">
                            {selectedLog.method || "N/A"}{" "}
                            {selectedLog.path || "No Path"}
                          </span>
                        </div>
                        {selectedLog.request_id && (
                          <div className="rounded-lg border border-border/60 p-3 bg-card shadow-sm sm:col-span-3">
                            <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                              Trace Request ID
                            </span>
                            <span className="font-semibold text-muted-foreground break-all">
                              {selectedLog.request_id}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isErrorLog(selectedLog) && selectedLog.stack_trace && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-destructive font-mono flex items-center gap-1.5">
                        <Code2 className="size-3.5" /> Stack Trace
                      </h4>
                      <ScrollArea className="h-64 rounded-xl border border-destructive/20 bg-[#0d0d0d]">
                        <pre className="p-4 text-rose-400/90 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all">
                          {selectedLog.stack_trace}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                      <FileJson className="size-3.5" /> Context Metadata Payload
                    </h4>
                    <div className="rounded-xl border border-border/60 bg-muted/30 font-mono text-xs overflow-x-auto p-4 shadow-inner">
                      <pre className="text-foreground/80 leading-relaxed">
                        {Object.keys(selectedLog.metadata).length > 0
                          ? JSON.stringify(selectedLog.metadata, null, 2)
                          : "// No metadata attached to this log."}
                      </pre>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}