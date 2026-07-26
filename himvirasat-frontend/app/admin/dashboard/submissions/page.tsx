"use client";

import { type FormEvent, useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  BookMarked,
  CheckCircle2,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SubmissionFormFields,
  MANDATORY_FIELDS,
} from "@/components/admin/submissions/submission-form-fields";
import {
  CreateSubmissionDto,
  WORKFLOW_RULES,
} from "@himvirasat/shared";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataLookupService } from "@/lib/services/admin/datalookup-service";
import { SubmissionService } from "@/lib/services/admin/submission-service";
import { useRouter } from "next/navigation";

const initialFormData: CreateSubmissionDto = {
  dialect_id: 0,
  word_devanagari: "",
  category_id: undefined,
  region: "",
  meaning: "",
  meaning_hindi: "",
  meaning_english: "",
  example_sentence: "",
  example_sentence_hindi: "",
  word_latin: "",
  ipa: "",
  example_sentence_english: "",
};

export default function ContributionSubmissionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] =
    useState<CreateSubmissionDto>(initialFormData);

  // Dynamic progress calculation based on MANDATORY_FIELDS array
  const completion = useMemo(() => {
    const completedCount = (MANDATORY_FIELDS as (keyof CreateSubmissionDto)[]).reduce(
      (acc: number, field) => {
        const val = formData[field];
        const isFilled =
          val !== undefined &&
          val !== null &&
          String(val).trim() !== "" &&
          val !== 0;
        return isFilled ? acc + 1 : acc;
      },
      0
    );

    return Math.round((completedCount / MANDATORY_FIELDS.length) * 100);
  }, [formData]);

  // Fetch Lookups
  const {
    data: dbDialects = [],
    isLoading: isLoadingDialects,
    isError: isErrorDialects,
  } = useQuery<string[]>({
    queryKey: ["datalookup", "available-dialects"],
    queryFn: DataLookupService.getAvailableDialects,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: dbCategories = [],
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useQuery<string[]>({
    queryKey: ["datalookup", "available-categories"],
    queryFn: DataLookupService.getAvailableCategories,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: dbPartsOfSpeech = [],
    isLoading: isLoadingPOS,
    isError: isErrorPOS,
  } = useQuery<string[]>({
    queryKey: ["datalookup", "available-pos"],
    queryFn: DataLookupService.getAvailablePartsOfSpeech,
    staleTime: 5 * 60 * 1000,
  });

  // Create Submission Mutation
  const submissionMutation = useMutation({
    mutationFn: (values: CreateSubmissionDto) =>
      SubmissionService.createSubmission(values),
    onSuccess: () => {
      toast.success("Submission sent to review", {
        description: WORKFLOW_RULES.under_review.description,
      });

      queryClient.invalidateQueries({ queryKey: ["contributions"] });

      setTimeout(() => {
        router.back();
      }, 300);
    },
    onError: (error: Error) => {
      toast.error("Submission failed", {
        description:
          error.message || "An unexpected error occurred during submission.",
      });
    },
  });

  useEffect(() => {
    if (isErrorDialects) toast.error("Failed to load dialects.");
    if (isErrorCategories) toast.error("Failed to load categories.");
    if (isErrorPOS) toast.error("Failed to load parts of speech.");
  }, [isErrorDialects, isErrorCategories, isErrorPOS]);

  const isDataSyncing =
    isLoadingDialects || isLoadingCategories || isLoadingPOS;
  const hasSyncFailure = isErrorDialects || isErrorCategories || isErrorPOS;
  const isSubmitting = submissionMutation.isPending;

  const handleFieldChange = (
    field: keyof CreateSubmissionDto,
    value: any
  ) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Iterate through mandatory fields array to ensure completeness
    for (const field of MANDATORY_FIELDS as (keyof CreateSubmissionDto)[]) {
      const val = formData[field];
      if (
        val === undefined ||
        val === null ||
        String(val).trim() === "" ||
        val === 0
      ) {
        const readableFieldName = String(field).replace(/_/g, " ").toUpperCase();
        toast.error("Missing Field", {
          description: `Please fulfill mandatory field: ${readableFieldName}`,
        });
        return;
      }
    }

    submissionMutation.mutate(formData);
  };

  if (isDataSyncing) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3 text-xs text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-primary" />
        <p>Loading database lookups...</p>
      </div>
    );
  }

  if (hasSyncFailure) {
    return (
      <div className="mx-auto my-12 max-w-md rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-xs text-destructive">
        <p className="font-semibold">Lookup Synchronization Error</p>
        <p className="mt-1 opacity-80">
          Failed to fetch mandatory parameters. Please refresh and try again.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.refresh()}
        >
          Reload Page
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 antialiased">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex min-h-screen w-full max-w-7xl flex-col"
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 rounded-md bg-background"
                  onClick={() => router.back()}
                  aria-label="Go back"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                      New Contribution
                    </h1>
                    <Badge
                      variant="secondary"
                      className="rounded-md text-[10px]"
                    >
                      {WORKFLOW_RULES.under_review.label}
                    </Badge>
                  </div>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {WORKFLOW_RULES.under_review.description}
                  </p>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden items-center gap-2 sm:flex">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="h-9 rounded-md text-xs font-semibold"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 rounded-md bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-3.5 animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit for review
                      <Send className="ml-2 size-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <span className="w-10 text-right text-[11px] font-semibold text-muted-foreground">
                {completion}%
              </span>
            </div>
          </div>
        </header>

        {/* Form Body */}
        <div className="flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <Card className="rounded-lg py-0 shadow-xs">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
                {/* Sidebar Info */}
                <aside className="border-b bg-muted/20 p-5 lg:border-b-0 lg:border-r lg:p-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-md border bg-background">
                        <BookMarked className="size-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Contribution Desk
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Peer Review Active
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                        <p>
                          Mandatory parameters initialize dictionary entries.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                        <p>
                          Language Experts and Language Heads will review
                          submitted entries.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Form Inputs */}
                <div className="p-5 sm:p-6 lg:p-8">
                  <SubmissionFormFields
                    values={formData as any}
                    dialects={dbDialects}
                    categories={dbCategories}
                    partsOfSpeech={dbPartsOfSpeech}
                    onChange={handleFieldChange as any}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Action Bar */}
        <div className="sticky bottom-0 z-20 border-t bg-background/95 px-4 py-3 backdrop-blur sm:hidden">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="h-9 rounded-md text-xs font-semibold"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 rounded-md bg-neutral-900 px-4 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                <>
                  Submit <Send className="ml-2 size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}