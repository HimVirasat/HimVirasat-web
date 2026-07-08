"use client";

import { type FormEvent, useMemo, useState, useEffect } from "react";
import { ArrowLeft, BookMarked, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SubmissionFormFields } from "@/components/admin/submissions/submission-form-fields";
import { SubmissionFormValues } from "@/types/admin/FSM/contribution-rules";
import { Contribution } from "@/types/admin/FSM/contribution-rules";
import { sharedMockDataset } from "@/types/admin/FSM/mockstore";
import { useQuery } from "@tanstack/react-query";
import { DataLookupService } from "@/lib/services/admin/datalookup-service";
import React from "react";

const contributor = {
  id: "usr_expert_77",
  name: "Jasper Dahl",
};

const initialFormData: SubmissionFormValues = {
  dialect: "",
  word_devanagari: "",
  category: "",
  part_of_speech: "",
  region: "",
  meaning_hindi: "",
  example_sentence: "",
  example_sentence_hindi_meaning: "",
  word_latin: "",
  example_sentence_latin: "",
  word_takri: "",
  example_sentence_takri: "",
};

// All Core section entries are strictly monitored
const coreRequiredFields: Array<keyof SubmissionFormValues> = [
  "dialect",
  "word_devanagari",
  "category",
  "part_of_speech",
  "region",
  "meaning_hindi",
  "example_sentence",
  "example_sentence_hindi_meaning",
];

const createId = (prefix: string) =>
  `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

export default function ContributionSubmissionPage() {
  const [formData, setFormData] =
    useState<SubmissionFormValues>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const completion = useMemo(() => {
    const completed = coreRequiredFields.filter((field) =>
      String(formData[field] || "").trim()
    ).length;
    return Math.round((completed / coreRequiredFields.length) * 100);
  }, [formData]);

  // 1. Fetch Dialects Dataset
  const {
    data: dbDialects = [],
    isLoading: isLoadingDialects,
    isError: isErrorDialects, // <-- Destructure the error state flag
  } = useQuery({
    queryKey: ["datalookup", "dialects"],
    queryFn: DataLookupService.getAvailableDialects,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch Categories Dataset
  const {
    data: dbCategories = [],
    isLoading: isLoadingCategories,
    isError: isErrorCategories, // <-- Destructure the error state flag
  } = useQuery({
    queryKey: ["datalookup", "categories"],
    queryFn: DataLookupService.getAvailableCategories,
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch Parts of Speech Dataset
  const {
    data: dbPartsOfSpeech = [],
    isLoading: isLoadingPOS,
    isError: isErrorPOS, // <-- Destructure the error state flag
  } = useQuery({
    queryKey: ["datalookup", "partsOfSpeech"],
    queryFn: DataLookupService.getAvailablePartsOfSpeech,
    staleTime: 5 * 60 * 1000,
  });
  // Trigger error toasts safely using a side-effect hook
  useEffect(() => {
    if (isErrorDialects) {
      toast.error("Failed to load dialects database records.");
    }
    if (isErrorCategories) {
      toast.error("Failed to load vocabulary categories database records.");
    }
    if (isErrorPOS) {
      toast.error("Failed to load parts of speech database records.");
    }
  }, [isErrorDialects, isErrorCategories, isErrorPOS]);

  // Aggregate states
  const isDataSyncing =
    isLoadingDialects || isLoadingCategories || isLoadingPOS;
  const hasSyncFailure = isErrorDialects || isErrorCategories || isErrorPOS;

  // Render a fallback layout if things are still loading
  if (isDataSyncing) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
        Synchronizing data...
      </div>
    );
  }
  if (hasSyncFailure) {
    return (
      <div className="p-8 text-center text-xs text-red-500 border border-red-200/40 bg-red-500/5 rounded-xl max-w-md mx-auto my-12">
        <p className="font-semibold">System Out of Sync</p>
        <p className="opacity-80 mt-1">
          Something really bad happened. Please refresh the page or check your
          connection.
        </p>
      </div>
    );
  }

  const handleFieldChange = <K extends keyof SubmissionFormValues>(
    field: K,
    value: SubmissionFormValues[K]
  ) => {
    setFormData((previous: any) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const missingFields = coreRequiredFields.filter(
      (field) => !String(formData[field] || "").trim()
    );

    if (missingFields.length > 0) {
      toast.error("Core section values missing", {
        description: "Please populate all mandatory fields in Section 1.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();

      const newSubmission: any = {
        id: createId("VOC-SUB"),
        contributor_id: contributor.id,
        contributor_name: contributor.name,
        dialect: formData.dialect.trim(),
        word_devanagari: formData.word_devanagari.trim(),
        category: formData.category.trim(),
        part_of_speech: formData.part_of_speech.trim(),
        region: formData.region.trim(),
        meaning_hindi: formData.meaning_hindi.trim(),
        example_sentence: formData.example_sentence.trim(),
        example_sentence_hindi_meaning:
          formData.example_sentence_hindi_meaning.trim(),

        // Advanced Optionals safely fallback to Null inside the ORM storage layer
        word_latin: formData.word_latin?.trim() || null,
        example_sentence_latin: formData.example_sentence_latin?.trim() || null,
        word_takri: formData.word_takri?.trim() || null,
        example_sentence_takri: formData.example_sentence_takri?.trim() || null,

        status: "under_review",
        review_comments: [],
        history: [
          {
            id: createId("HE"),
            type: "submitted",
            actor_id: contributor.id,
            actor_name: contributor.name,
            message: "Submitted core and advanced details for language review.",
            created_at: timestamp,
          },
        ],
        created_at: timestamp,
        updated_at: timestamp,
      };

      sharedMockDataset.unshift(newSubmission);

      toast.success("Submission sent to review", {
        description: "The entry is now in the Under Review queue.",
      });

      setTimeout(() => {
        window.history.back();
      }, 450);
    } catch {
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30 antialiased">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex min-h-screen w-full max-w-7xl flex-col"
      >
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 rounded-md bg-background"
                  onClick={() => window.history.back()}
                  aria-label="Go back"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                      New vocabulary submission
                    </h1>
                    <Badge
                      variant="secondary"
                      className="rounded-md text-[10px]"
                    >
                      Under Review
                    </Badge>
                  </div>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Provide a structured contribution with mandatory core items
                    and additional fields.
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => window.history.back()}
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
                  {isSubmitting ? "Submitting..." : "Submit for review"}
                  {!isSubmitting && <Send className="ml-2 size-3.5" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <span className="w-10 text-right text-[11px] font-semibold text-muted-foreground">
                {completion}%
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <Card className="rounded-lg py-0 shadow-xs">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="border-b bg-muted/20 p-5 lg:border-b-0 lg:border-r lg:p-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-md border bg-background">
                        <BookMarked className="size-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Contributor desk
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contributor.name}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-600" />
                        <p>
                          Core elements are parsed to construct direct
                          translations mapping.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-600" />
                        <p>
                          Advanced fields offer deep tracking of phonetics and
                          context.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>

                <div className="p-5 sm:p-6 lg:p-8">
                  <SubmissionFormFields
                    values={formData}
                    dialects={dbDialects}
                    categories={dbCategories}
                    partsOfSpeech={dbPartsOfSpeech}
                    onChange={handleFieldChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-0 z-20 border-t bg-background/95 px-4 py-3 backdrop-blur sm:hidden">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => window.history.back()}
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
              {isSubmitting ? "Submitting..." : "Submit"}
              {!isSubmitting && <Send className="ml-2 size-3.5" />}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
