"use client";

import React, { useState } from "react";
import {
  MapPin,
  Tag,
  Layers,
  AlertTriangle,
  CheckCircle2,
  User,
  Clock,
  MessageSquare,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  WORKFLOW_RULES,
} from "@/types/admin/FSM/contribution-rules";

interface WorkspaceContentProps {
  currentItem: Contribution;
  activeUser: { id: string; username: string; role: any };
  workspaceTab: "content" | "activity";
  isEditMode: boolean;
  editForm: Partial<Contribution>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Contribution>>>;
  reviewerComment: string;
  setReviewerComment: (comment: string) => void;
  handleApprove: (id: string) => void;
  handleFlag: (id: string) => void;
  handleReject: (id: string) => void;
}

export default function WorkspaceContent({
  currentItem,
  activeUser,
  workspaceTab,
  isEditMode,
  editForm,
  setEditForm,
  reviewerComment,
  setReviewerComment,
  handleApprove,
  handleFlag,
  handleReject,
}: WorkspaceContentProps) {
  // Local dialog open management states
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isFlagOpen, setIsFlagOpen] = useState(false);

  return (
    <>
      <ScrollArea className="flex-1 min-h-0 px-8 py-6 bg-transparent">
        <div className="max-w-3xl space-y-6">
          {workspaceTab === "content" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border/40">
                  ID: {currentItem.id}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Submitted on:{" "}
                  {new Date(currentItem.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/40 pb-6">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Devanagari Root Script
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editForm.word_devanagari || ""}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          word_devanagari: e.target.value,
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
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          word_latin: e.target.value,
                        }))
                      }
                      className="font-mono bg-background border-border text-foreground"
                    />
                  ) : (
                    <p className="text-xl font-medium tracking-wide text-muted-foreground italic select-all">
                      {currentItem.word_latin || "—"}
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
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, ipa: e.target.value }))
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
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, meaning: e.target.value }))
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Hindi Cross-Mapping Index
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editForm.meaning_hindi || ""}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          meaning_hindi: e.target.value,
                        }))
                      }
                      className="bg-background text-foreground border-border"
                    />
                  ) : (
                    <p className="font-bold text-foreground/90">
                      {currentItem.meaning_hindi || "—"}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    English Equivalent
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editForm.meaning_english || ""}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          meaning_english: e.target.value,
                        }))
                      }
                      className="bg-background text-foreground border-border"
                    />
                  ) : (
                    <p className="font-bold text-foreground/90">
                      {currentItem.meaning_english || "—"}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
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
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              example_sentence: e.target.value,
                            }))
                          }
                          className="font-semibold bg-background text-foreground border-border"
                        />
                      ) : (
                        <p className="text-base font-bold text-foreground select-all">
                          {`"${currentItem.example_sentence}"`}
                        </p>
                      )}{" "}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5 border-t border-indigo-500/20 dark:border-indigo-500/10">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground block">
                          English Translation
                        </span>
                        {isEditMode ? (
                          <Input
                            value={editForm.example_sentence_english || ""}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                example_sentence_english: e.target.value,
                              }))
                            }
                            className="bg-background text-foreground border-border"
                          />
                        ) : (
                          <p className="text-xs text-muted-foreground font-medium select-all">
                            {currentItem.example_sentence_english || "—"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground block">
                          Hindi Translation
                        </span>
                        {isEditMode ? (
                          <Input
                            value={editForm.example_sentence_hindi || ""}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                example_sentence_hindi: e.target.value,
                              }))
                            }
                            className="bg-background text-foreground border-border"
                          />
                        ) : (
                          <p className="text-xs text-muted-foreground font-medium select-all">
                            {currentItem.example_sentence_hindi || "—"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="border border-border/50 bg-card/40 dark:bg-card/20 p-2.5 rounded-lg flex items-center gap-2.5">
                  <Layers className="size-3.5 text-muted-foreground/70 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-medium text-muted-foreground block uppercase">
                      Dialect
                    </span>
                    <span className="text-xs font-bold text-foreground block truncate">
                      {currentItem.dialect}
                    </span>
                  </div>
                </div>
                <div className="border border-border/50 bg-card/40 dark:bg-card/20 p-2.5 rounded-lg flex items-center gap-2.5">
                  <MapPin className="size-3.5 text-muted-foreground/70 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-medium text-muted-foreground block uppercase">
                      Regional Zone
                    </span>
                    {isEditMode ? (
                      <Input
                        value={editForm.region || ""}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, region: e.target.value }))
                        }
                        className="h-6 text-xs px-1 bg-background text-foreground border-border"
                      />
                    ) : (
                      <span className="text-xs font-bold text-foreground block truncate">
                        {currentItem.region || "Statewide Standard"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="border border-border/50 bg-card/40 dark:bg-card/20 p-2.5 rounded-lg flex items-center gap-2.5">
                  <Tag className="size-3.5 text-muted-foreground/70 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-medium text-muted-foreground block uppercase">
                      Vocabulary Category
                    </span>
                    {isEditMode ? (
                      <Input
                        value={editForm.category || ""}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                        className="h-6 text-xs px-1 bg-background text-foreground border-border"
                      />
                    ) : (
                      <span className="text-xs font-bold text-foreground block truncate">
                        {currentItem.category || "General Vocabulary"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentItem.status === "questionable" &&
                currentItem.questionable_reason && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3 text-xs">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-400">
                        Active Flag Reason
                      </span>
                      <p className="text-foreground font-medium">
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                          Flag Raised By ({currentItem.questionable_by}):
                        </span>{" "}
                        {currentItem.questionable_reason}
                      </p>
                    </div>
                  </div>
                )}

              {/* <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Automated System Heuristic Flags
                </h3>
                <div className="border border-border/40 rounded-xl p-3.5 bg-muted/20 dark:bg-muted/10 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>
                      Unicode Block Compliance: Script strings parse correctly
                      inside Devanagari core range boundaries.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>
                      Cross-Reference Schema: Valid relational maps confirmed
                      against standard dictionary arrays.
                    </span>
                  </div>
                </div>
              </div> */}

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
            </div>
          )}
          <div className="shrink-0 border-t border-border bg-card/90 dark:bg-background/95 backdrop-blur px-6 py-3 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)] -mt-1 relative z-10">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
              {/* Left Side: Status / Role Info */}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/80 dark:bg-muted/40 px-2.5 py-1 rounded-md border border-border/60">
                <Clock className="size-3 text-indigo-500" />
                <span>
                  Role Level:{" "}
                  <span className="font-bold text-foreground capitalize">
                    {activeUser.role.replace("_", " ")}
                  </span>
                </span>
              </div>

              {/* Right Side: Clean Button Row */}
              <div className="flex items-center gap-2 ml-auto">
                {/* REJECT ALERT DIALOG WITH INTERNAL REASON FIELD */}
                {WORKFLOW_RULES[currentItem.status].canReject(
                  activeUser.role
                ) && (
                  <AlertDialog
                    open={isRejectOpen}
                    onOpenChange={(open) => {
                      setIsRejectOpen(open);
                      if (!open) setReviewerComment("");
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-semibold text-destructive dark:text-red-400 hover:bg-destructive/10 px-3 rounded-lg transition-colors"
                      >
                        <Trash2 className="size-3.5 mr-1.5" /> Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background border border-border max-w-md rounded-2xl shadow-xl p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Trash2 className="size-4 text-destructive" /> Reject
                          Entry Confirmation
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                          Are you certain you want to reject this contribution
                          entry node ({currentItem.id})? This will drop it out
                          of the evaluation timeline completely.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="my-4 space-y-1.5">
                        <label
                          htmlFor="reject-reason"
                          className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block"
                        >
                          Rejection Reason{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <Textarea
                          id="reject-reason"
                          placeholder="Provide specific validation failure reasons or notes..."
                          value={reviewerComment}
                          onChange={(e) => setReviewerComment(e.target.value)}
                          className="min-h-18 text-xs bg-muted/20 text-foreground border-border focus-visible:ring-destructive rounded-lg resize-none"
                        />
                      </div>

                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="h-8 text-xs rounded-lg border border-border bg-background text-foreground m-0">
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-white rounded-lg px-4"
                          disabled={!reviewerComment.trim()}
                          onClick={() => {
                            handleReject(currentItem.id);
                            setIsRejectOpen(false);
                          }}
                        >
                          Confirm Rejection
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* FLAG CONCERNS ALERT DIALOG WITH INTERNAL REASON FIELD */}
                {WORKFLOW_RULES[currentItem.status].canFlag(
                  activeUser.id,
                  currentItem,
                  activeUser.role
                ) && (
                  <AlertDialog
                    open={isFlagOpen}
                    onOpenChange={(open) => {
                      setIsFlagOpen(open);
                      if (!open) setReviewerComment("");
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold border-amber-500/30 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 bg-background hover:bg-amber-500/5 px-3 shadow-none rounded-lg transition-colors"
                      >
                        <AlertTriangle className="size-3.5 mr-1.5" /> Flag
                        Concerns
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background border border-border max-w-md rounded-2xl shadow-xl p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                          <AlertTriangle className="size-4 text-amber-500" />{" "}
                          Flag Contentious Items
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                          Are you sure you want to flag concerns regarding this
                          item? It will step back to questionable status
                          awaiting remediation guidelines.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="my-4 space-y-1.5">
                        <label
                          htmlFor="flag-reason"
                          className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block"
                        >
                          Flag Reasoning Summary{" "}
                          <span className="text-amber-600">*</span>
                        </label>
                        <Textarea
                          id="flag-reason"
                          placeholder="Describe linguistic concerns, formatting discrepancies, or dialect errors..."
                          value={reviewerComment}
                          onChange={(e) => setReviewerComment(e.target.value)}
                          className="min-h-18 text-xs bg-muted/20 text-foreground border-border focus-visible:ring-amber-500 rounded-lg resize-none"
                        />
                      </div>

                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="h-8 text-xs rounded-lg border border-border bg-background text-foreground m-0">
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          size="sm"
                          className="h-8 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4"
                          disabled={!reviewerComment.trim()}
                          onClick={() => {
                            handleFlag(currentItem.id);
                            setIsFlagOpen(false);
                          }}
                        >
                          Flag Entry
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* ACTION EXECUTE BUTTON & AUTHORIZATION LOCKS */}
                {WORKFLOW_RULES[currentItem.status].canApprove(
                  activeUser.id,
                  currentItem,
                  activeUser.role
                ) ? (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(currentItem.id)}
                    className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="size-3.5 mr-1.5" />
                    {currentItem.status === "pending_review_1" &&
                      "Pass L1 Evaluation"}
                    {currentItem.status === "pending_review_2" &&
                      "Authorize Production Release"}
                    {currentItem.status === "questionable" &&
                      "Resolve and Rescue Token"}
                    {currentItem.status === "draft" &&
                      "Submit to Open Pipeline"}
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-muted/60 dark:bg-muted/30 border border-border/80 px-3.5 h-8 rounded-lg cursor-not-allowed select-none">
                          <UserCheck className="size-3.5" /> Authorization
                          Lockout
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        align="end"
                        className="p-2.5 max-w-xs border border-border bg-popover text-popover-foreground rounded-xl shadow-md"
                      >
                        <p className="text-[11px] leading-normal font-medium">
                          Your current role is ({activeUser.role}) and you
                          cannot make changes under {currentItem.status}. Rules
                          restrict users from performing some actions.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      {/* Action Workspace Bar */}
    </>
  );
}
