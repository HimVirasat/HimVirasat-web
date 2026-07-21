"use client";

import React from "react";
import { Inbox, Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Contribution,
  ContributionStatus,
  getOpenReviewCommentCount,
} from "@/types/admin/contribution-types";

export type QueueFilter =
  | "my_submissions"
  | "under_review"
  | "approved"
  | "flagged"
  | "rejected";

interface QueueSidebarProps {
  activeUserId: string;
  queueFilter: QueueFilter;
  setQueueFilter: (filter: QueueFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  queueFilteredItems: Contribution[];
  selectedId: string;
  handleSelectItem: (id: string) => void;
  isLoading?: boolean;
}

const filterPipelineStages = [
  { id: "my_submissions", label: "My Submissions" },
  { id: "under_review", label: "Under Review" },
  { id: "approved", label: "Approved" },
  { id: "flagged", label: "Flagged" },
  { id: "rejected", label: "Rejected" },
] as const;

export default function QueueSidebar({
  activeUserId,
  queueFilter,
  setQueueFilter,
  searchQuery,
  setSearchQuery,
  queueFilteredItems,
  selectedId,
  handleSelectItem,
  isLoading = false,
}: QueueSidebarProps) {
  const activeStageIndex = filterPipelineStages.findIndex(
    (stage) => stage.id === queueFilter
  );

  return (
    <aside className="w-85 shrink-0 border-r flex flex-col min-h-0 bg-background">
      <div className="border-b space-y-4 pt-5 pb-3">
        <div className="relative flex justify-between w-full px-4 z-0">
          {filterPipelineStages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              {idx > 0 && renderPipelineConnector(idx, activeStageIndex, queueFilter)}
              {renderPipelineNode(stage, idx, queueFilter, setQueueFilter)}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search queue"
            className="h-8 pl-8 text-xs bg-muted/20 border-border"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 bg-transparent">
        {isLoading
          ? renderLoadingState()
          : queueFilteredItems.length === 0
          ? renderEmptyState()
          : renderQueueList(
              queueFilteredItems,
              selectedId,
              queueFilter,
              activeUserId,
              handleSelectItem
            )}
      </ScrollArea>
    </aside>
  );
}

function renderLoadingState() {
  return (
    <div className="divide-y border-b border-border/40">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="w-full p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function renderPipelineConnector(idx: number, activeStageIndex: number, queueFilter: QueueFilter) {
  const isSegmentActive = idx <= activeStageIndex && activeStageIndex !== 0;
  const activeTone = getPipelineTone(queueFilter);

  return (
    <div
      className={cn(
        "absolute top-2.25 h-0.5 transition-colors duration-300 -z-10",
        idx === 1
          ? "left-[10%] right-[70%]"
          : idx === 2
          ? "left-[30%] right-[50%]"
          : idx === 3
          ? "left-[50%] right-[30%]"
          : "left-[70%] right-[10%]",
        isSegmentActive ? getActiveLineClasses(activeTone) : "bg-neutral-200 dark:bg-neutral-800"
      )}
    />
  );
}

function renderPipelineNode(
  stage: (typeof filterPipelineStages)[number],
  idx: number,
  queueFilter: QueueFilter,
  setQueueFilter: (filter: QueueFilter) => void
) {
  const isActive = queueFilter === stage.id;
  const activeTone = getPipelineTone(queueFilter);

  return (
    <button
      onClick={() => setQueueFilter(stage.id)}
      className="flex flex-col items-center gap-2 flex-1 relative group cursor-pointer"
    >
      <div
        className={cn(
          "size-4.5 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] shadow-sm z-10",
          isActive
            ? getActiveNodeClasses(activeTone)
            : "bg-background border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-600"
        )}
      >
        {isActive && <div className="size-1.5 rounded-full bg-white" />}
      </div>
      <span
        className={cn(
          "text-[10px] font-semibold transition-colors",
          isActive ? getActiveTextClasses(activeTone) : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        {stage.label}
      </span>
    </button>
  );
}

function renderEmptyState() {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground h-64">
      <Inbox className="size-6 stroke-[1.5] mb-2 text-muted-foreground/50" />
      <p className="text-xs font-semibold text-foreground/80">Queue is clear</p>
      <p className="text-[11px] max-w-48 mx-auto mt-0.5 opacity-70">
        No vocabulary entries match this filter and search.
      </p>
    </div>
  );
}

function renderQueueList(
  items: Contribution[],
  selectedId: string,
  queueFilter: QueueFilter,
  activeUserId: string,
  handleSelectItem: (id: string) => void
) {
  return (
    <div className="divide-y border-b border-border/40">
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const openComments = getOpenReviewCommentCount(item);
        const totalComments = item.review_comments?.length || 0;
        const isMine = item.contributor_id === activeUserId;
        const badgeCfg = statusBadgeConfig[item.status];
        const shortId = item.id.slice(-4);

        return (
          <button
            key={item.id}
            onClick={() => handleSelectItem(item.id)}
            className={cn(
              "w-full p-3.5 cursor-pointer text-left transition-all relative flex flex-col gap-1.5 group",
              isSelected
                ? "bg-accent/40 backdrop-blur-xs after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-indigo-600 dark:after:bg-indigo-400"
                : "hover:bg-muted/20"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm tracking-tight text-foreground truncate">
                {item.word_devanagari}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground opacity-80 shrink-0">
                ...{shortId}
              </span>
            </div>

            <p className="text-xs text-muted-foreground/90 font-medium truncate max-w-72">
              {item.meaning}
            </p>

            {queueFilter === "my_submissions" && (
              <p className="text-[11px] text-muted-foreground truncate">
                {openComments} unresolved comments · {item.history?.[0]?.message ?? "No reviewer activity yet."}
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[11px] font-semibold text-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded truncate">
                  {item.dialects?.name || "Standard"}
                </span>
                {isMine && <span className="text-[10px] text-muted-foreground shrink-0">My Submission</span>}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {totalComments > 0 && (
                  <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px] font-medium">
                    <MessageSquare className="size-3" />
                    {totalComments} Total ({openComments} Open)
                  </Badge>
                )}
                <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 font-semibold border shadow-none", badgeCfg.style)}>
                  {badgeCfg.label}
                </Badge>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const statusBadgeConfig: Record<ContributionStatus, { label: string; style: string }> = {
  under_review: { label: "Under Review", style: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400" },
  approved: { label: "Approved", style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" },
  flagged: { label: "Flagged", style: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" },
  rejected: { label: "Rejected", style: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400" },
};

const getPipelineTone = (filter: QueueFilter) => {
  if (filter === "flagged") return "amber";
  if (filter === "rejected") return "red";
  if (filter === "approved") return "emerald";
  if (filter === "my_submissions") return "indigo";
  return "blue";
};

const getActiveNodeClasses = (tone: string) => {
  const map: Record<string, string> = {
    amber: "bg-amber-500 border-amber-500 ring-4 ring-amber-500/20",
    red: "bg-red-500 border-red-500 ring-4 ring-red-500/20",
    emerald: "bg-emerald-500 border-emerald-500 ring-4 ring-emerald-500/20",
    indigo: "bg-indigo-500 border-indigo-500 ring-4 ring-indigo-500/20",
    blue: "bg-blue-500 border-blue-500 ring-4 ring-blue-500/20",
  };
  return map[tone] || map.blue;
};

const getActiveTextClasses = (tone: string) => {
  const map: Record<string, string> = {
    amber: "text-amber-600",
    red: "text-red-600",
    emerald: "text-emerald-600",
    indigo: "text-indigo-600",
    blue: "text-blue-600",
  };
  return map[tone] || map.blue;
};

const getActiveLineClasses = (tone: string) => {
  const map: Record<string, string> = {
    amber: "bg-amber-500",
    red: "bg-red-500",
    emerald: "bg-emerald-500",
    indigo: "bg-indigo-500",
    blue: "bg-blue-500",
  };
  return map[tone] || map.blue;
};
// // components/admin/review-queue/queue-sidebar.tsx
// "use client";

// import React from "react";
// import { Inbox, Search, MessageSquare } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Skeleton } from "@/components/ui/skeleton";
// import { cn } from "@/lib/utils";
// import {
//   Contribution,
//   ContributionStatus,
//   getOpenReviewCommentCount,
// } from "@/types/admin/contribution-types";

// export type QueueFilter =
//   | "my_submissions"
//   | "under_review"
//   | "approved"
//   | "flagged"
//   | "rejected";

// interface QueueSidebarProps {
//   activeUserId: string;
//   queueFilter: QueueFilter;
//   setQueueFilter: (filter: QueueFilter) => void;
//   searchQuery: string;
//   setSearchQuery: (query: string) => void;
//   queueFilteredItems: Contribution[];
//   selectedId: string;
//   handleSelectItem: (id: string) => void;
//   isLoading?: boolean;
// }

// const filterPipelineStages = [
//   { id: "my_submissions", label: "My Submissions" },
//   { id: "under_review", label: "Under Review" },
//   { id: "approved", label: "Approved" },
//   { id: "flagged", label: "Flagged" },
//   { id: "rejected", label: "Rejected" },
// ] as const;

// export default function QueueSidebar({
//   activeUserId,
//   queueFilter,
//   setQueueFilter,
//   searchQuery,
//   setSearchQuery,
//   queueFilteredItems,
//   selectedId,
//   handleSelectItem,
//   isLoading = false,
// }: QueueSidebarProps) {
//   const activeStageIndex = filterPipelineStages.findIndex(
//     (stage) => stage.id === queueFilter
//   );

//   return (
//     <aside className="w-85 shrink-0 border-r flex flex-col min-h-0 bg-background">
//       <div className="border-b space-y-4 pt-5 pb-3">
//         <div className="relative flex justify-between w-full px-4 z-0">
//           {filterPipelineStages.map((stage, idx) => (
//             <React.Fragment key={stage.id}>
//               {idx > 0 && renderPipelineConnector(idx, activeStageIndex, queueFilter)}
//               {renderPipelineNode(stage, idx, queueFilter, setQueueFilter)}
//             </React.Fragment>
//           ))}
//         </div>
//       </div>

//       <div className="p-3 border-b">
//         <div className="relative">
//           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
//           <Input
//             value={searchQuery}
//             onChange={(event) => setSearchQuery(event.target.value)}
//             placeholder="Search queue"
//             className="h-8 pl-8 text-xs bg-muted/20 border-border"
//           />
//         </div>
//       </div>

//       <ScrollArea className="flex-1 min-h-0 bg-transparent">
//         {isLoading
//           ? renderLoadingState()
//           : queueFilteredItems.length === 0
//             ? renderEmptyState()
//             : renderQueueList(
//               queueFilteredItems,
//               selectedId,
//               queueFilter,
//               activeUserId,
//               handleSelectItem
//             )}
//       </ScrollArea>
//     </aside>
//   );
// }

// function renderLoadingState() {
//   return (
//     <div className="divide-y border-b border-border/40">
//       {[1, 2, 3, 4, 5].map((i) => (
//         <div key={i} className="w-full p-4 flex flex-col gap-3">
//           <div className="flex items-center justify-between">
//             <Skeleton className="h-4 w-32" />
//             <Skeleton className="h-3 w-16" />
//           </div>
//           <Skeleton className="h-3 w-full" />
//           <Skeleton className="h-3 w-4/5" />
//           <div className="flex justify-between pt-2">
//             <Skeleton className="h-4 w-16" />
//             <Skeleton className="h-4 w-20" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function renderPipelineConnector(idx: number, activeStageIndex: number, queueFilter: QueueFilter) {
//   const isSegmentActive = idx <= activeStageIndex && activeStageIndex !== 0;
//   const activeTone = getPipelineTone(queueFilter);

//   return (
//     <div
//       className={cn(
//         "absolute top-2.25 h-0.5 transition-colors duration-300 -z-10",
//         idx === 1 ? "left-[10%] right-[70%]" :
//           idx === 2 ? "left-[30%] right-[50%]" :
//             idx === 3 ? "left-[50%] right-[30%]" : "left-[70%] right-[10%]",
//         isSegmentActive ? getActiveLineClasses(activeTone) : "bg-neutral-200 dark:bg-neutral-800"
//       )}
//     />
//   );
// }

// function renderPipelineNode(
//   stage: (typeof filterPipelineStages)[number],
//   idx: number,
//   queueFilter: QueueFilter,
//   setQueueFilter: (filter: QueueFilter) => void
// ) {
//   const isActive = queueFilter === stage.id;
//   const activeTone = getPipelineTone(queueFilter);

//   return (
//     <button
//       onClick={() => setQueueFilter(stage.id)}
//       className="flex flex-col items-center gap-2 flex-1 relative group cursor-pointer"
//     >
//       <div
//         className={cn(
//           "size-4.5 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] shadow-sm z-10",
//           isActive
//             ? getActiveNodeClasses(activeTone)
//             : "bg-background border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-600"
//         )}
//       >
//         {isActive && <div className="size-1.5 rounded-full bg-white" />}
//       </div>
//       <span
//         className={cn(
//           "text-[10px] font-semibold transition-colors",
//           isActive ? getActiveTextClasses(activeTone) : "text-muted-foreground group-hover:text-foreground"
//         )}
//       >
//         {stage.label}
//       </span>
//     </button>
//   );
// }

// function renderEmptyState() {
//   return (
//     <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground h-64">
//       <Inbox className="size-6 stroke-[1.5] mb-2 text-muted-foreground/50" />
//       <p className="text-xs font-semibold text-foreground/80">Queue is clear</p>
//       <p className="text-[11px] max-w-48 mx-auto mt-0.5 opacity-70">
//         No vocabulary entries match this filter and search.
//       </p>
//     </div>
//   );
// }

// function renderQueueList(
//   items: Contribution[],
//   selectedId: string,
//   queueFilter: QueueFilter,
//   activeUserId: string,
//   handleSelectItem: (id: string) => void
// ) {
//   return (
//     <div className="divide-y border-b border-border/40">
//       {items.map((item) => {
//         const isSelected = item.id === selectedId;
//         const openComments = getOpenReviewCommentCount(item);
//         const totalComments = item.review_comments?.length || 0;
//         const isMine = item.contributor_id === activeUserId;
//         const badgeCfg = statusBadgeConfig[item.status];

//         return (
//           <button
//             key={item.id}
//             onClick={() => handleSelectItem(item.id)}
//             className={cn(
//               "w-full p-3.5 cursor-pointer text-left transition-all relative flex flex-col gap-1.5 group",
//               isSelected
//                 ? "bg-accent/40 backdrop-blur-xs after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-indigo-600 dark:after:bg-indigo-400"
//                 : "hover:bg-muted/20"
//             )}
//           >
//             <div className="flex items-center justify-between gap-2">
//               <span className="font-bold text-sm tracking-tight text-foreground truncate">
//                 {item.word_devanagari}
//               </span>
//               <span className="text-[10px] font-mono text-muted-foreground opacity-80 shrink-0">
//                 {item.id}
//               </span>
//             </div>

//             <p className="text-xs text-muted-foreground/90 font-medium truncate max-w-72">
//               {item.meaning}
//             </p>

//             {queueFilter === "my_submissions" && (
//               <p className="text-[11px] text-muted-foreground truncate">
//                 {openComments} unresolved comments · {item.history?.[0]?.message ?? "No reviewer activity yet."}
//               </p>
//             )}

//             <div className="flex items-center justify-between pt-1">
//               <div className="flex items-center gap-1.5 min-w-0">
//                 <span className="text-[11px] font-semibold text-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded truncate">
//                   {item.dialects?.name || "Standard"}
//                 </span>
//                 {isMine && <span className="text-[10px] text-muted-foreground shrink-0">My Submission</span>}
//               </div>

//               <div className="flex items-center gap-2 shrink-0">
//                 {totalComments > 0 && (
//                   <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px] font-medium">
//                     <MessageSquare className="size-3" />
//                     {openComments === 0 ? "Resolved" : `${openComments} Open`}
//                   </Badge>
//                 )}
//                 <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 font-semibold border shadow-none", badgeCfg.style)}>
//                   {badgeCfg.label}
//                 </Badge>
//               </div>
//             </div>
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// const statusBadgeConfig: Record<ContributionStatus, { label: string; style: string }> = {
//   under_review: { label: "Under Review", style: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400" },
//   approved: { label: "Approved", style: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" },
//   flagged: { label: "Flagged", style: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" },
//   rejected: { label: "Rejected", style: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400" },
// };

// const getPipelineTone = (filter: QueueFilter) => {
//   if (filter === "flagged") return "amber";
//   if (filter === "rejected") return "red";
//   if (filter === "approved") return "emerald";
//   if (filter === "my_submissions") return "indigo";
//   return "blue";
// };

// const getActiveNodeClasses = (tone: string) => {
//   const map: Record<string, string> = {
//     amber: "bg-amber-500 border-amber-500 ring-4 ring-amber-500/20",
//     red: "bg-red-500 border-red-500 ring-4 ring-red-500/20",
//     emerald: "bg-emerald-500 border-emerald-500 ring-4 ring-emerald-500/20",
//     indigo: "bg-indigo-500 border-indigo-500 ring-4 ring-indigo-500/20",
//     blue: "bg-blue-500 border-blue-500 ring-4 ring-blue-500/20",
//   };
//   return map[tone] || map.blue;
// };

// const getActiveTextClasses = (tone: string) => {
//   const map: Record<string, string> = {
//     amber: "text-amber-600",
//     red: "text-red-600",
//     emerald: "text-emerald-600",
//     indigo: "text-indigo-600",
//     blue: "text-blue-600",
//   };
//   return map[tone] || map.blue;
// };

// const getActiveLineClasses = (tone: string) => {
//   const map: Record<string, string> = {
//     amber: "bg-amber-500",
//     red: "bg-red-500",
//     emerald: "bg-emerald-500",
//     indigo: "bg-indigo-500",
//     blue: "bg-blue-500",
//   };
//   return map[tone] || map.blue;
// };