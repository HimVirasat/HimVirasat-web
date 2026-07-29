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
  Terminal,
  Loader2,
  Layers,
  Globe,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Server,
  FileJson,
  ExternalLink,
  Info,
  Copy,
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
import { ActivityLog, ErrorLog, ServiceCategory } from "@himvirasat/shared";

const SERVICE_CATEGORIES: { label: string; value: ServiceCategory | "ALL" }[] = [
  { label: "All Services", value: "ALL" },
  { label: "Auth", value: "auth" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Data Lookup", value: "datalookup" },
  { label: "Review Queue", value: "review_queue" },
  { label: "Submissions", value: "submissions" },
  { label: "Users", value: "users" },
];

export default function LogsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"activity" | "error">("activity");
  const [selectedService, setSelectedService] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLiveTail, setIsLiveTail] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Inspector Drawer State
  const [selectedLog, setSelectedLog] = useState<ActivityLog | ErrorLog | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // TanStack Query for Activity Logs
  const {
    data: rawActivityLogs = [],
    isLoading: isLoadingActivity,
    refetch: refetchActivity,
    isFetching: isFetchingActivity,
  } = useQuery<ActivityLog[]>({
    queryKey: ["activity-logs", selectedService, statusFilter, currentPage, pageSize],
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

  // TanStack Query for Error Logs
  const {
    data: rawErrorLogs = [],
    isLoading: isLoadingError,
    refetch: refetchError,
    isFetching: isFetchingError,
  } = useQuery<ErrorLog[]>({
    queryKey: ["error-logs", selectedService, statusFilter, currentPage, pageSize],
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

  const isLoading = activeTab === "activity" ? isLoadingActivity : isLoadingError;
  const isFetching = activeTab === "activity" ? isFetchingActivity : isFetchingError;

  // Pagination Calculations
  const activeDataset = activeTab === "activity" ? rawActivityLogs : rawErrorLogs;
  const totalItems = activeDataset.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return activeDataset.slice(startIndex, startIndex + pageSize);
  }, [activeDataset, currentPage, pageSize]);

  // Telemetry Aggregation Metrics
  const metrics = useMemo(() => {
    if (activeTab === "activity") {
      const successCount = rawActivityLogs.filter((l) => l.status === "SUCCESS").length;
      const failedCount = rawActivityLogs.filter((l) => l.status === "FAILED").length;
      return { total: rawActivityLogs.length, success: successCount, failed: failedCount };
    } else {
      return {
        total: rawErrorLogs.length,
        critical: rawErrorLogs.filter((e) => e.code?.includes("CRITICAL") || e.code?.includes("500")).length,
        standard: rawErrorLogs.filter((e) => !e.code?.includes("CRITICAL")).length,
      };
    }
  }, [activeTab, rawActivityLogs, rawErrorLogs]);

  const handleCopyJson = (data: any) => {
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
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Terminal className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none">
              System Audit & Exception Telemetry
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
              Real-time server log stream & error diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isLiveTail ? "default" : "outline"}
            size="sm"
            className="h-8 gap-2 text-xs font-mono"
            onClick={() => setIsLiveTail((prev) => !prev)}
          >
            <RefreshCw
              className={cn("size-3.5", (isFetching || isLiveTail) && "animate-spin")}
            />
            {isLiveTail ? "Live Tail: Active (5s)" : "Live Tail: Paused"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={handleRefresh}
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            Sync Now
          </Button>
        </div>
      </header>

      {/* 2. Main Container with flex layout constraints for dynamic zooms */}
      <main className="flex flex-1 flex-col min-h-0 overflow-hidden p-4 md:p-6 gap-4 bg-muted/20">
        {/* Telemetry Header Cards */}
        <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="bg-card/70 border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  Total Telemetry Events
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
                      Successful Operations
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
                      Failed Execution Attempts
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
                      Critical Exceptions
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
                      Standard Exception Logs
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
              setActiveTab(v as any);
              setCurrentPage(1);
            }}
            className="w-auto"
          >
            <TabsList className="grid w-64 grid-cols-2">
              <TabsTrigger value="activity" className="gap-2 text-xs font-semibold">
                <Activity className="size-3.5" /> Activity Stream
              </TabsTrigger>
              <TabsTrigger value="error" className="gap-2 text-xs font-semibold">
                <AlertOctagon className="size-3.5" /> Exceptions
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Select
              value={selectedService}
              onValueChange={(val) => {
                setSelectedService(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 min-w-40 text-xs bg-background">
                <Layers className="mr-1.5 size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Service Category" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-xs">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 min-w-32 text-xs bg-background">
                <Filter className="mr-1.5 size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="SUCCESS" className="text-xs">SUCCESS</SelectItem>
                <SelectItem value="FAILED" className="text-xs">FAILED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table + Footer Wrapper (min-h-0 allows flex child scrolling) */}
        <div className="flex flex-1 flex-col min-h-0 rounded-xl border bg-card shadow-xs overflow-hidden">
          {/* Scrollable Table Content Area */}
          <div className="relative flex-1 min-h-0 overflow-auto">
            {isLoading ? (
              <div className="flex h-full min-h-48 items-center justify-center text-xs text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                Retrieving telemetry logs...
              </div>
            ) : paginatedLogs.length === 0 ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground p-6">
                <Info className="size-8 text-muted-foreground/50" />
                <p className="font-semibold">No telemetry log entries found</p>
                <p className="text-[11px]">Try resetting selected filters.</p>
              </div>
            ) : activeTab === "activity" ? (
              <Table>
                <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-xs">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-28 text-[11px] font-mono">TIMESTAMP</TableHead>
                    <TableHead className="text-[11px] font-mono">ACTION / EVENT</TableHead>
                    <TableHead className="text-[11px] font-mono">SERVICE</TableHead>
                    <TableHead className="text-[11px] font-mono">TRIGGERED BY</TableHead>
                    <TableHead className="w-56 text-[11px] font-mono">ENTITY TARGET</TableHead>
                    <TableHead className="w-20 text-[11px] font-mono">STATUS</TableHead>
                    <TableHead className="w-12 text-right text-[11px] font-mono">INSPECT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-mono text-xs">
                  {(paginatedLogs as ActivityLog[]).map((log) => (
                    <TableRow
                      key={log.id}
                      onClick={() => handleOpenLog(log)}
                      className="cursor-pointer transition-colors hover:bg-muted/60"
                    >
                      <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        <Badge variant="outline" className="font-mono text-[10px] bg-primary/5 text-primary border-primary/20">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono bg-muted text-muted-foreground">
                          {log.service_category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-sans font-medium text-foreground max-w-40">
                        <div className="flex flex-col min-w-0">
                          {/* Unique Identifier / Handle */}
                          <span className="font-mono text-xs font-semibold truncate">
                            {log.actor_id || "System"}
                          </span>
                          {/* Display Name as muted subtext */}
                          {log.actor_name && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              {log.actor_name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ""}
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
                    <TableHead className="w-28 text-[11px] font-mono">TIMESTAMP</TableHead>
                    <TableHead className="text-[11px] font-mono">ERROR CODE</TableHead>
                    <TableHead className="text-[11px] font-mono">SERVICE</TableHead>
                    <TableHead className="text-[11px] font-mono">HTTP ROUTE</TableHead>
                    <TableHead className="text-[11px] font-mono">MESSAGE EXCEPTION</TableHead>
                    <TableHead className="text-[11px] font-mono">USER</TableHead>
                    <TableHead className="w-12 text-right text-[11px] font-mono">INSPECT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-mono text-xs">
                  {(paginatedLogs as ErrorLog[]).map((log) => (
                    <TableRow
                      key={log.id}
                      onClick={() => handleOpenLog(log)}
                      className="cursor-pointer transition-colors hover:bg-muted/60"
                    >
                      <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="text-[10px] font-mono font-bold">
                          {log.code || "500_EXC"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {log.service_category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {log.method || "POST"} {log.path || "/"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground font-sans">
                        {log.error_message}
                      </TableCell>
                      <TableCell className="font-sans font-medium">
                        {log.user_name || log.user_id || "Anonymous"}
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

          {/* Locked Pagination Controls Footer */}
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
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
        <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0 bg-background overflow-hidden">
          {selectedLog && (
            <>
              <SheetHeader className="p-6 border-b bg-muted/20 shrink-0">
                <div className="flex items-center justify-between pr-6">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
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
                <SheetTitle className="text-base font-bold font-mono tracking-tight mt-2 text-foreground">
                  {"action" in selectedLog ? selectedLog.action : selectedLog.error_message}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground">
                  ID: {selectedLog.id} • {new Date(selectedLog.created_at).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                      <Server className="size-3.5" /> Overview & Attributes
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="rounded-lg border p-2.5 bg-card">
                        <p className="text-[10px] text-muted-foreground uppercase">Status</p>
                        <p className="font-bold mt-0.5">{selectedLog.status}</p>
                      </div>
                      <div className="rounded-lg border p-2.5 bg-card">
                        <p className="text-[10px] text-muted-foreground uppercase">Trigger Actor / User</p>
                        <p className="font-bold mt-0.5 truncate">
                          {"user_name" in selectedLog
                            ? selectedLog.user_name || selectedLog.user_id || "Anonymous"
                            : "actor_name" in selectedLog
                              ? selectedLog.actor_name || selectedLog.actor_id || "System"
                              : "System"}
                        </p>
                      </div>
                      {"entity_type" in selectedLog && (
                        <div className="rounded-lg border p-2.5 bg-card col-span-2">
                          <p className="text-[10px] text-muted-foreground uppercase">Target Entity</p>
                          <p className="font-bold mt-0.5">
                            {selectedLog.entity_type} {selectedLog.entity_id ? `(${selectedLog.entity_id})` : ""}
                          </p>
                        </div>
                      )}
                      {"path" in selectedLog && (
                        <div className="rounded-lg border p-2.5 bg-card col-span-2">
                          <p className="text-[10px] text-muted-foreground uppercase">HTTP Route Execution</p>
                          <p className="font-bold mt-0.5">
                            {selectedLog.method} {selectedLog.path}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {"stack_trace" in selectedLog && selectedLog.stack_trace && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-destructive font-mono flex items-center gap-1.5">
                        <Code2 className="size-3.5" /> Exception Stack Trace
                      </h4>
                      <pre className="p-4 rounded-xl border bg-black text-red-400 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-60">
                        {selectedLog.stack_trace}
                      </pre>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                      <FileJson className="size-3.5" /> Context Metadata Payload
                    </h4>
                    <div className="p-4 rounded-xl border bg-muted/40 font-mono text-xs overflow-x-auto">
                      <pre className="text-foreground leading-relaxed">
                        {JSON.stringify(selectedLog.metadata || {}, null, 2)}
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