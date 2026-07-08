"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flag,
  Lock,
  MapPin,
  MessageSquarePlus,
  ShieldAlert,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Contribution,
  ReviewCommentStatus,
  SystemRole,
  WORKFLOW_RULES,
  getOpenReviewCommentCount,
  isAuthorityRole,
} from "@/types/admin/FSM/contribution-rules";
import { cn } from "@/lib/utils";

interface WorkspaceContentProps {
  currentItem: Contribution;
  activeUser: { id: string; username: string; role: SystemRole };
  workspaceTab: "content" | "comments" | "activity";
  isEditMode: boolean;
  editForm: Partial<Contribution>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Contribution>>>;
  handleAddComment: (id: string, fieldName: string, message: string) => void;
  handleCommentStatusChange: (
    contributionId: string,
    commentId: string,
    action: "accepted" | "resolved" | "rejected"
  ) => void;
  handleApprove: (id: string) => void;
  handleSubmitForReview: (id: string) => void;
  handleFlag: (id: string, reason: string) => void;
  handleRemoveFlag: (id: string) => void;
  handleReject: (id: string, reason: string) => void;
}

const fieldOptions = [
  "General",
  "Devanagari",
  "Latin Text",
  "IPA",
  "Meaning",
  "Hindi Meaning",
  "English Meaning",
  "Example Sentence",
  "Region",
  "Category",
];

const statusStyles: Record<ReviewCommentStatus, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  resolved:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function WorkspaceContent({
  currentItem,
  activeUser,
  workspaceTab,
  isEditMode,
  editForm,
  setEditForm,
  handleAddComment,
  handleCommentStatusChange,
  handleApprove,
  handleSubmitForReview,
  handleFlag,
  handleRemoveFlag,
  handleReject,
}: WorkspaceContentProps) {
  const [commentField, setCommentField] = useState("General");
  const [commentMessage, setCommentMessage] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isFlagOpen, setIsFlagOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const rules = WORKFLOW_RULES[currentItem.status];
  const openCommentCount = getOpenReviewCommentCount(currentItem);
  const isContributor = currentItem.contributor_id === activeUser.id;
  const canComment = rules.canComment(
    activeUser.id,
    currentItem,
    activeUser.role
  );
  const canApprove = rules.canApprove(
    activeUser.id,
    currentItem,
    activeUser.role
  );
  const canOverride =
    isAuthorityRole(activeUser.role) &&
    (currentItem.status === "under_review" || currentItem.status === "flagged");
  const approvalLocked =
    currentItem.status === "under_review" &&
    openCommentCount > 0 &&
    !canApprove;

  const latestHistory = useMemo(
    () =>
      [...currentItem.history].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [currentItem.history]
  );

  const submitComment = () => {
    if (!commentMessage.trim()) return;
    handleAddComment(currentItem.id, commentField, commentMessage.trim());
    setCommentField("General");
    setCommentMessage("");
  };

  return (
    <>
      <ScrollArea className="flex-1 min-h-0 px-8 py-6 bg-transparent">
        <div className="max-w-3xl space-y-6">
          {workspaceTab === "content" && (
            <div className="space-y-4">
              {(currentItem.status === "flagged" ||
                currentItem.status === "rejected") && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3 text-xs">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-400">
                        {currentItem.status === "flagged"
                          ? "Active Flag"
                          : "Rejected Entry"}
                      </span>
                      <p className="text-foreground font-medium">
                        {currentItem.status === "flagged"
                          ? currentItem.flag_reason
                          : currentItem.rejected_reason}
                      </p>
                    </div>
                  </div>
                )}

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/40">
                  ID: {currentItem.id}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Submitted on:{" "}
                  {new Date(currentItem.created_at).toLocaleDateString()}
                </span>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {rules.label}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/40 pb-6">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Devanagari Root Script
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editForm.word_devanagari || ""}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          word_devanagari: event.target.value,
                        }))
                      }
                      className="font-bold text-lg bg-background border-border text-foreground"
                    />
                  ) : (
                    <h2 className="text-3xl font-extrabold text-foreground tracking-tight select-all">
                      {currentItem.word_devanagari}
                    </h2>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Latin Text
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editForm.word_latin || ""}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          word_latin: event.target.value,
                        }))
                      }
                      className="font-mono bg-background border-border text-foreground"
                    />
                  ) : (
                    <p className="text-xl font-medium tracking-wide text-muted-foreground italic select-all">
                      {currentItem.word_latin || "-"}
                    </p>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    International Phonetic Alphabet (IPA)
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editForm.ipa || ""}
                      onChange={(event) =>
                        setEditForm((previous) => ({
                          ...previous,
                          ipa: event.target.value,
                        }))
                      }
                      className="font-mono max-w-sm bg-background border-border text-foreground"
                    />
                  ) : (
                    <span className="inline-flex items-center font-mono text-xs tracking-wide text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/5 dark:bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 select-all">
                      /{currentItem.ipa || "Not Documented"}/
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Detailed Dialect Meaning
                </label>
                {isEditMode ? (
                  <Textarea
                    value={editForm.meaning || ""}
                    onChange={(event) =>
                      setEditForm((previous) => ({
                        ...previous,
                        meaning: event.target.value,
                      }))
                    }
                    className="min-h-20 bg-background border-border text-foreground"
                  />
                ) : (
                  <div className="bg-muted/40 dark:bg-muted/20 border border-border/40 p-4.5 rounded-xl text-foreground font-medium leading-relaxed shadow-inner">
                    {currentItem.meaning}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 dark:bg-muted/10 p-4 rounded-xl border border-border/40">
                <FieldValue
                  label="Hindi Cross-Mapping Index"
                  value={currentItem.meaning_hindi}
                  editing={isEditMode}
                  editValue={editForm.meaning_hindi}
                  onChange={(value) =>
                    setEditForm((previous) => ({
                      ...previous,
                      meaning_hindi: value,
                    }))
                  }
                />
                <FieldValue
                  label="English Equivalent"
                  value={currentItem.meaning_english}
                  editing={isEditMode}
                  editValue={editForm.meaning_english}
                  onChange={(value) =>
                    setEditForm((previous) => ({
                      ...previous,
                      meaning_english: value,
                    }))
                  }
                />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Usage Validation Context Sentences
                </h4>
                <div className="relative overflow-hidden rounded-xl bg-indigo-500/2 p-4.5 border border-indigo-500/20 dark:border-indigo-500/10">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/60" />
                  <div className="space-y-3.5 pl-1">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase block">
                        Dialect Execution
                      </span>
                      {isEditMode ? (
                        <Input
                          value={editForm.example_sentence || ""}
                          onChange={(event) =>
                            setEditForm((previous) => ({
                              ...previous,
                              example_sentence: event.target.value,
                            }))
                          }
                          className="font-semibold bg-background text-foreground border-border"
                        />
                      ) : (
                        <p className="text-base font-bold text-foreground select-all">
                          "{currentItem.example_sentence}"
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5 border-t border-indigo-500/20 dark:border-indigo-500/10">
                      <FieldValue
                        label="English Translation"
                        value={currentItem.example_sentence_english}
                        editing={isEditMode}
                        editValue={editForm.example_sentence_english}
                        onChange={(value) =>
                          setEditForm((previous) => ({
                            ...previous,
                            example_sentence_english: value,
                          }))
                        }
                        compact
                      />
                      <FieldValue
                        label="Hindi Translation"
                        value={currentItem.example_sentence_hindi}
                        editing={isEditMode}
                        editValue={editForm.example_sentence_hindi}
                        onChange={(value) =>
                          setEditForm((previous) => ({
                            ...previous,
                            example_sentence_hindi: value,
                          }))
                        }
                        compact
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <MetaBox
                  icon={User}
                  label="Contributor"
                  value={currentItem.contributor_name}
                />
                <MetaBox
                  icon={MapPin}
                  label="Regional Zone"
                  value={currentItem.region || "Statewide Standard"}
                />
                <MetaBox
                  icon={Tag}
                  label="Vocabulary Category"
                  value={currentItem.category || "General Vocabulary"}
                />
              </div>
            </div>
          )}

          {workspaceTab === "comments" && (
            <div className="space-y-4">
              {canComment && (
                <Card className="rounded-lg py-0 shadow-none bg-card/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <MessageSquarePlus className="size-3.5" />
                      Add Review Comment
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={commentField}
                        onValueChange={setCommentField}
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-full sm:w-48 bg-background"
                        >
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map((field) => (
                            <SelectItem key={field} value={field}>
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={commentMessage}
                        onChange={(event) =>
                          setCommentMessage(event.target.value)
                        }
                        placeholder="Leave a concise review note or suggested change."
                        className="min-h-20 text-xs bg-background"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={!commentMessage.trim()}
                        onClick={submitComment}
                      >
                        Add Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentItem.review_comments.length === 0 ? (
                <div className="rounded-xl border border-border/50 bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                  No review comments have been added.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentItem.review_comments.map((comment) => (
                    <Card
                      key={comment.id}
                      className="rounded-lg py-0 shadow-none"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>
                              {initials(comment.author_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold text-foreground">
                                  {comment.author_name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {new Date(
                                    comment.created_at
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] capitalize",
                                  statusStyles[comment.status]
                                )}
                              >
                                {comment.status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {comment.field_name || "General"}
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">
                                {comment.message}
                              </p>
                            </div>
                            {isContributor && comment.status === "open" && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    handleCommentStatusChange(
                                      currentItem.id,
                                      comment.id,
                                      "accepted"
                                    )
                                  }
                                >
                                  Accept suggestion
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    handleCommentStatusChange(
                                      currentItem.id,
                                      comment.id,
                                      "rejected"
                                    )
                                  }
                                >
                                  Reject suggestion
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    handleCommentStatusChange(
                                      currentItem.id,
                                      comment.id,
                                      "resolved"
                                    )
                                  }
                                >
                                  Mark resolved
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {workspaceTab === "activity" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  User Information
                </h3>
                <div className="border border-border/40 rounded-xl bg-card/50 dark:bg-card/20 divide-y divide-border/40 text-xs">
                  <div className="p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <User className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {currentItem.contributor_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Initial Entry
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-muted-foreground/80 text-[11px]">
                      {new Date(currentItem.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  History
                </h3>
                <div className="rounded-xl border border-border/40 bg-card/40 divide-y divide-border/40">
                  {latestHistory.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 flex items-start gap-3 text-xs"
                    >
                      <Clock className="size-3.5 text-muted-foreground mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">
                          {event.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {event.actor_name} ·{" "}
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {event.type.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t border-border bg-card/90 dark:bg-background/95 backdrop-blur px-6 py-3 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)] relative z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/80 dark:bg-muted/40 px-2.5 py-1 rounded-md border border-border/60">
            <Clock className="size-3 text-indigo-500" />
            <span>
              Role:{" "}
              <span className="font-bold text-foreground capitalize">
                {activeUser.role.replace("_", " ")}
              </span>
              {openCommentCount > 0 && (
                <span className="ml-2">{openCommentCount} unresolved</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* {currentItem.status === "draft" && isContributor && (
              <Button
                size="sm"
                onClick={() => handleSubmitForReview(currentItem.id)}
                className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg shadow-sm"
              >
                Submit for Review
              </Button>
            )} */}

            {rules.canReject(activeUser.role) &&
              currentItem.status !== "rejected" && (
                <ReasonDialog
                  open={isRejectOpen}
                  onOpenChange={setIsRejectOpen}
                  title="Reject Entry"
                  description="Rejecting closes this contribution and records the reason in history."
                  reason={rejectReason}
                  setReason={setRejectReason}
                  reasonLabel="Rejection Reason"
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-semibold text-destructive dark:text-red-400 hover:bg-destructive/10 px-3 rounded-lg"
                    >
                      <Trash2 className="size-3.5 mr-1.5" /> Reject
                    </Button>
                  }
                  actionLabel="Reject Entry"
                  actionClassName="bg-destructive hover:bg-destructive/90 text-white"
                  onConfirm={() => {
                    handleReject(currentItem.id, rejectReason.trim());
                    setRejectReason("");
                  }}
                />
              )}

            {rules.canRemoveFlag(activeUser.role) &&
              currentItem.status === "flagged" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-background"
                  onClick={() => handleRemoveFlag(currentItem.id)}
                >
                  <ShieldAlert className="size-3.5 mr-1.5" />
                  Remove Flag
                </Button>
              )}

            {rules.canFlag(activeUser.id, currentItem, activeUser.role) && (
              <ReasonDialog
                open={isFlagOpen}
                onOpenChange={setIsFlagOpen}
                title="Flag Entry"
                description="Flagged entries move to the dedicated authority review queue."
                reason={flagReason}
                setReason={setFlagReason}
                reasonLabel="Flag Reason"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold border-amber-500/30 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 bg-background hover:bg-amber-500/5 px-3 shadow-none rounded-lg"
                  >
                    <Flag className="size-3.5 mr-1.5" /> Flag
                  </Button>
                }
                actionLabel="Flag Entry"
                actionClassName="bg-amber-600 hover:bg-amber-700 text-white"
                onConfirm={() => {
                  handleFlag(currentItem.id, flagReason.trim());
                  setFlagReason("");
                }}
              />
            )}

            {canApprove || canOverride ? (
              <Button
                size="sm"
                onClick={() => handleApprove(currentItem.id)}
                disabled={!canApprove && !canOverride}
                className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg shadow-sm"
              >
                <CheckCircle2 className="size-3.5 mr-1.5" />
                {openCommentCount > 0 && canOverride
                  ? "Override & Approve"
                  : "Approve"}
              </Button>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-muted/60 dark:bg-muted/30 border border-border/80 px-3.5 h-8 rounded-lg select-none">
                <Lock className="size-3.5" />
                {approvalLocked
                  ? "Resolve comments before approval"
                  : "No review action available"}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FieldValue({
  label,
  value,
  editing,
  editValue,
  onChange,
  compact = false,
}: {
  label: string;
  value: string | null;
  editing: boolean;
  editValue: string | null | undefined;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label
        className={cn(
          "font-bold text-muted-foreground uppercase tracking-wider block",
          compact ? "text-[10px]" : "text-[10px]"
        )}
      >
        {label}
      </label>
      {editing ? (
        <Input
          value={editValue || ""}
          onChange={(event) => onChange(event.target.value)}
          className="bg-background text-foreground border-border"
        />
      ) : (
        <p className="font-bold text-foreground/90">{value || "-"}</p>
      )}
    </div>
  );
}

function MetaBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border/50 bg-card/40 dark:bg-card/20 p-2.5 rounded-lg flex items-center gap-2.5">
      <Icon className="size-3.5 text-muted-foreground/70 shrink-0" />
      <div className="min-w-0">
        <span className="text-[9px] font-medium text-muted-foreground block uppercase">
          {label}
        </span>
        <span className="text-xs font-bold text-foreground block truncate">
          {value}
        </span>
      </div>
    </div>
  );
}

function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  reason,
  setReason,
  reasonLabel,
  trigger,
  actionLabel,
  actionClassName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  reason: string;
  setReason: (reason: string) => void;
  reasonLabel: string;
  trigger: React.ReactNode;
  actionLabel: string;
  actionClassName: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setReason("");
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-background border border-border max-w-md rounded-2xl shadow-xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm font-bold text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            {reasonLabel} <span className="text-destructive">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Add a specific reason."
            className="min-h-18 text-xs bg-muted/20 text-foreground border-border rounded-lg resize-none"
          />
        </div>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="h-8 text-xs rounded-lg border border-border bg-background text-foreground m-0">
            Cancel
          </AlertDialogCancel>
          <Button
            size="sm"
            className={cn(
              "h-8 text-xs font-semibold rounded-lg px-4",
              actionClassName
            )}
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
