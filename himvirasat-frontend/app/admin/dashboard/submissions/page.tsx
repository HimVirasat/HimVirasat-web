"use client";

import { useState } from "react";
import { ArrowLeft, BookMarked, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmissionFormFields } from "@/components/admin/submissions/submission-form-fields";
import { Contribution } from "@/types/admin/FSM/contribution-rules";
import { sharedMockDataset } from "@/types/admin/FSM/mockstore";
import { toast } from "sonner";

export default function ContributionSubmissionPage() {
  const [formData, setFormData] = useState<Partial<Contribution>>({
    dialect: "",
    category: "",
    region: "",
    word_devanagari: "",
    word_latin: "",
    ipa: "",
    meaning: "",
    example_sentence: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: keyof Contribution, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.dialect ||
      !formData.word_devanagari ||
      !formData.meaning ||
      !formData.example_sentence
    ) {
      toast.error("Validation Error", {
        description:
          "Please populate all critical linguistic fields marked with (*)",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newSubmission: Contribution = {
        id: `VOC-SUB-${Math.floor(1000 + Math.random() * 9000)}`,
        contributor_id: "usr_contrib_local_test",
        contributor_name: "Local Tester (You)",
        dialect: formData.dialect,
        word_devanagari: formData.word_devanagari,
        meaning: formData.meaning,
        example_sentence: formData.example_sentence,
        region: formData.region || "Statewide Standard",
        category: formData.category || "General Vocabulary",
        word_latin: formData.word_latin || "",
        ipa: formData.ipa || "",
        meaning_hindi: "",
        meaning_english: "",
        example_sentence_english: "",
        example_sentence_hindi: "",
        status: "pending_review_1",
        level1_reviewer_id: null,
        level2_reviewer_id: null,
        questionable_by: null,
        questionable_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      sharedMockDataset.unshift(newSubmission);

      toast.success("Record Indexed", {
        description: "Pushed to memory pipeline stack successfully.",
      });

      setTimeout(() => {
        window.history.back();
      }, 400);
    } catch (error) {
      toast.error("Process execution aborted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-12 flex items-start justify-center antialiased">
      <div className="w-full max-w-6xl relative">
        <div className="relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden flex flex-col">
          {/* Header Panel */}
          <div className="px-8 sm:px-12 py-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl size-9 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                  <BookMarked className="size-4 text-indigo-600 dark:text-indigo-400" />
                  Lexicographical Index Desk
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Compile dialects, phonemic variables, and runtime linguistic
                  telemetry.
                </p>
              </div>
            </div>
          </div>

          {/* Form Content Wrapper */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="px-8 sm:px-12 py-8 bg-white dark:bg-neutral-900">
              <SubmissionFormFields
                values={formData}
                onChange={handleFieldChange}
              />
            </div>

            {/* Standard Footer Action Tray */}
            <div className="px-8 sm:px-12 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
                className="rounded-xl px-4 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl px-5 h-9 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 shadow-xs transition-all"
              >
                {isSubmitting
                  ? "Processing Matrix..."
                  : "Commit Entry to Queue"}
                {!isSubmitting && <Send className="size-3.5 ml-2" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
