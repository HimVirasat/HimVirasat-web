"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
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
import { DataLookupService } from "@/lib/services/admin/datalookup-service";
import {
  ActivityLog,
  ErrorLog,
  BACKEND_MODULE_CATEGORIES,
  LOG_STATUS,
} from "@himvirasat/shared";

const isErrorLog = (log: ActivityLog | ErrorLog): log is ErrorLog => {
  return "error_message" in log;
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

export default function LogsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"activity" | "error">("activity");
  const [selectedService, setSelectedService] = useState<
    BACKEND_MODULE_CATEGORIES | "ALL"
  >("ALL");
  const [statusFilter, setStatusFilter] = useState<LOG_STATUS | "ALL">("ALL");
  const [isLiveTail, setIsLiveTail] = useState(false);
  const [copied, setCopied] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedLog, setSelectedLog] = useState<ActivityLog | ErrorLog | null>(
    null
  );
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const {
    data: activityLogs = [],
    isLoading: isLoadingActivity,
    refetch: refetchActivity,
    isFetching: isFetchingActivity,
  } = useQuery<ActivityLog[]>({
    queryKey: [
      "activity-logs",
      selectedService,
      statusFilter,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      DataLookupService.getActivityLogs({
        service: selectedService !== "ALL" ? selectedService : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page: currentPage,
        limit: pageSize,
      }),
    enabled: activeTab === "activity",
    refetchInterval: isLiveTail ? 5000 : false,
  });

  const {
    data: errorLogs = [],
    isLoading: isLoadingError,
    refetch: refetchError,
    isFetching: isFetchingError,
  } = useQuery<ErrorLog[]>({
    queryKey: [
      "error-logs",
      selectedService,
      statusFilter,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      DataLookupService.getErrorLogs({
        service: selectedService !== "ALL" ? selectedService : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
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

  const activeDataset = activeTab === "activity" ? activityLogs : errorLogs;
  const hasNextPage = activeDataset.length === pageSize;

  const metrics = useMemo(() => {
    if (activeTab === "activity") {
      return {
        total: activityLogs.length,
        success: activityLogs.filter((l) => l.status === "SUCCESS").length,
        failed: activityLogs.filter((l) => l.status === "FAILED").length,
      };
    } else {
      return {
        total: errorLogs.length,
        critical: errorLogs.filter(
          (e) => e.code?.includes("500") || e.code?.includes("501")
        ).length,
        standard: errorLogs.filter(
          (e) => !e.code?.includes("500") && !e.code?.includes("501")
        ).length,
      };
    }
  }, [activeTab, activityLogs, errorLogs]);

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

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      {/* 1. Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6 bg-card/60 backdrop-blur-md z-10">
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
            {isLiveTail ? "Live Tail: Active (5s)" : "Live Tail: Paused"}
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
            Sync Now
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col min-h-0 overflow-hidden p-4 md:p-6 gap-4 bg-muted/20">
        <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="bg-card/70 border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  Events on Page
                </p>
                <p className="text-2xl font-bold font-mono tracking-tight mt-1">
                  {metrics.total}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Layers className="size-5" />
              </div>
            </CardContent>
          </Card>

          {activeTab === "activity" ? (
            <>
              <Card className="bg-card/70 border-border/60 shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                      Successful Ops
                    </p>
                    <p className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                      {metrics.success}
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Check className="size-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/70 border-border/60 shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider font-mono">
                      Failed Attempts
                    </p>
                    <p className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 mt-1">
                      {metrics.failed}
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="size-5" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="bg-card/70 border-border/60 shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-destructive uppercase tracking-wider font-mono">
                      Critical Exceptions (5xx)
                    </p>
                    <p className="text-2xl font-bold font-mono tracking-tight text-destructive mt-1">
                      {metrics.critical}
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <AlertOctagon className="size-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/70 border-border/60 shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono">
                      Standard Logged Errors
                    </p>
                    <p className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 mt-1">
                      {metrics.standard}
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Code2 className="size-5" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filter Controls Card */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-xs">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as "activity" | "error");
              setCurrentPage(1);
            }}
            className="w-auto"
          >
            <TabsList className="grid w-64 grid-cols-2">
              <TabsTrigger
                value="activity"
                className="gap-2 text-xs font-semibold"
              >
                <Activity className="size-3.5" /> Activity Stream
              </TabsTrigger>
              <TabsTrigger
                value="error"
                className="gap-2 text-xs font-semibold"
              >
                <AlertOctagon className="size-3.5" /> Exceptions
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Select
              value={selectedService}
              onValueChange={(val) => {
                setSelectedService(val as BACKEND_MODULE_CATEGORIES | "ALL");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 min-w-40 text-xs bg-background">
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

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val as LOG_STATUS | "ALL");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 min-w-32 text-xs bg-background">
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
          </div>
        </div>

        {/* Table + Footer Wrapper */}
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
                  Try adjusting your filters or checking a different page.
                </p>
              </div>
            ) : activeTab === "activity" ? (
              <Table>
                <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-xs">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-28 text-[11px] font-mono">
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
                  {(activeDataset as ActivityLog[]).map((log) => (
                    <TableRow
                      key={log.id}
                      onClick={() => handleOpenLog(log)}
                      className="cursor-pointer transition-colors hover:bg-muted/60"
                    >
                      <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString()}
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
                          variant="secondary"
                          className="text-[10px] uppercase font-mono bg-muted text-muted-foreground"
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
                        <Button variant="ghost" size="icon" className="size-7">
                          <ExternalLink className="size-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-xs">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-28 text-[11px] font-mono">
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
                  {(activeDataset as ErrorLog[]).map((log) => (
                    <TableRow
                      key={log.id}
                      onClick={() => handleOpenLog(log)}
                      className="cursor-pointer transition-colors hover:bg-muted/60"
                    >
                      <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString()}
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
                          className="text-[10px] uppercase font-mono"
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
                        <Button variant="ghost" size="icon" className="size-7">
                          <ExternalLink className="size-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="flex shrink-0 items-center justify-between border-t px-4 py-2.5 bg-card text-xs">
            <div className="flex items-center gap-2 text-muted-foreground font-mono">
              <span>Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-16 text-xs bg-background">
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

            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-mono">
                Page {currentPage}
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

      {/* Drawer Inspector */}
      <Sheet open={isInspectorOpen} onOpenChange={setIsInspectorOpen}>
        <SheetContent className="sm:max-w-2xl w-full flex flex-col p-0 gap-0 bg-background overflow-hidden border-l border-border">
          {selectedLog && (
            <>
              <SheetHeader className="p-6 border-b bg-muted/20 shrink-0">
                <div className="flex items-center justify-between pr-6">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase bg-background"
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
                <SheetTitle className="text-base font-bold font-mono tracking-tight mt-2 text-foreground wrap-break-word">
                  {isErrorLog(selectedLog)
                    ? selectedLog.error_message
                    : selectedLog.action}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  ID: {selectedLog.id} •{" "}
                  {new Date(selectedLog.created_at).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              {/* Scrollable Detail View */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-6 space-y-6">
                  {/* Overview Attributes */}
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

                  {/* Error Specific Details (Rendered strictly using the type guard) */}
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
                        <div className="rounded-lg border border-border/60 p-3 bg-card shadow-sm col-span-2">
                          <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                            HTTP Route Execution
                          </span>
                          <span className="font-bold">
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

                  {/* Metadata Context Payload */}
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
