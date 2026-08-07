"use client";

import { useState, type ElementType, type ReactNode } from "react";
import {
  BookOpen,
  Languages,
  MapPin,
  Quote,
  SpellCheck,
  Tags,
  Type,
  FileText,
  Sparkles,
  Loader2,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CreateSubmissionSchema, // Value (for validation)
  type CreateSubmissionDto, // Type (for TypeScript types)
} from "@himvirasat/shared";

// Alias or use it as your form values type
export type SubmissionFormValues = CreateSubmissionDto;
import { DataLookupService } from "@/lib/services/admin/datalookup-service"; // Adjust import path if needed

// Explicit array of mandatory field keys used for Checklist & Progress tracking
export const MANDATORY_FIELDS: Array<keyof SubmissionFormValues> = [
  "dialect_name",
  "word_devanagari",
  "category_id",
  "part_of_speech_id" as keyof SubmissionFormValues,
  "region",
  "meaning_hindi",
  "meaning_english",
  "example_sentence",
  "example_sentence_hindi",
];

type OptionItem = string | { id: number | string; name: string };

interface FormFieldsProps {
  values: SubmissionFormValues;
  dialects: OptionItem[];
  categories: OptionItem[];
  partsOfSpeech: OptionItem[];
  regions?: OptionItem[]; // Added regions option prop
  onChange: <K extends keyof SubmissionFormValues>(
    field: K,
    value: SubmissionFormValues[K]
  ) => void;
}

const inputClass =
  "h-10 rounded-md border-border bg-background text-sm shadow-none";

const textareaClass =
  "min-h-24 rounded-md border-border bg-background text-sm leading-relaxed shadow-none resize-y";

export function SubmissionFormFields({
  values,
  dialects = [],
  categories = [],
  partsOfSpeech = [],
  regions = [], // Destructured regions prop
  onChange,
}: FormFieldsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [grokError, setGrokError] = useState<string | null>(null);

  // Helper to check if a specific field is completed
  const isFieldComplete = (field: keyof SubmissionFormValues) => {
    const val = (values as Record<string, any>)[field];
    return (
      val !== undefined &&
      val !== null &&
      String(val).trim() !== "" &&
      val !== 0
    );
  };

  // Trigger Grok AI generation via DataLookupService
  const handleGenerateWithGrok = async () => {
    setGrokError(null);

    if (!values.word_devanagari) {
      setGrokError("Please fill in the 'Word in Devanagari' field first.");
      return;
    }

    try {
      setIsGenerating(true);

      const data = await DataLookupService.generateMetadata({
        word_devanagari: values.word_devanagari,
        meaning_hindi: (values.meaning_hindi ?? values.meaning) || undefined,
        meaning_english: values.meaning_english ?? undefined,
        example_sentence: values.example_sentence ?? undefined,
      });
      // Automatically update fields in parent state
      if (data.word_latin) onChange("word_latin", data.word_latin);
      if (data.word_takri) onChange("word_takri" as any, data.word_takri);
      if (data.ipa) onChange("ipa", data.ipa);
      if (data.example_sentence_latin) {
        onChange("example_sentence_latin" as any, data.example_sentence_latin);
        onChange("example_sentence_english", data.example_sentence_latin);
      }
      if (data.example_sentence_takri) {
        onChange("example_sentence_takri" as any, data.example_sentence_takri);
      }
    } catch (err: any) {
      setGrokError(
        err.message ||
        "An error occurred while calling the metadata generation service."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-10">
        {/* SECTION 1: MANDATORY FIELDS */}
        <FormSection
          eyebrow="SECTION 1"
          title="Core Lexical Fields"
          description="All parameters in this primary segment are required to form a viable lexical resource entry."
        >
          {/* Row 1: Dialect & Word in Devanagari */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Dialect" required icon={Languages}>
              <Select
                value={values.dialect_name || ""}
                onValueChange={(val) => onChange("dialect_name", val)}
              >
                <SelectTrigger className={cn(inputClass, "w-full")}>
                  <SelectValue placeholder="Choose dialect" />
                </SelectTrigger>
                <SelectContent>
                  {dialects.map((item) => {
                    const name = typeof item === "object" ? item.name : item;
                    const id = typeof item === "object" ? item.id : name;
                    return (
                      <SelectItem key={id} value={name}>
                        {name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground border border-border/50">
                <Info className="size-3.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
                <span>Reach out to a Language Head to modify your dialects.</span>
              </div>
            </Field>

            <Field label="Word in Devanagari" required icon={Type}>
              <Input
                className={cn(inputClass, "font-semibold")}
                placeholder="उदाहरणात्मक शब्द"
                value={values.word_devanagari || ""}
                onChange={(e) => onChange("word_devanagari", e.target.value)}
              />
            </Field>
          </div>

          {/* Row 2: Category & Part of Speech */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category" required icon={Tags}>
              <Select
                value={values.category_id ? String(values.category_id) : ""}
                onValueChange={(val) =>
                  onChange("category_id", val ? Number(val) : undefined)
                }
              >
                <SelectTrigger className={cn(inputClass, "w-full")}>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item, index) => {
                    const id = typeof item === "object" ? item.id : index + 1;
                    const name = typeof item === "object" ? item.name : item;
                    return (
                      <SelectItem key={id} value={String(id)}>
                        {name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Part of Speech" required icon={FileText}>
              <Select
                value={
                  (values as any).part_of_speech_id
                    ? String((values as any).part_of_speech_id)
                    : ""
                }
                onValueChange={(val) =>
                  onChange(
                    "part_of_speech_id" as any,
                    val ? Number(val) : undefined
                  )
                }
              >
                <SelectTrigger className={cn(inputClass, "w-full")}>
                  <SelectValue placeholder="Select Part of Speech" />
                </SelectTrigger>
                <SelectContent>
                  {partsOfSpeech.map((item, index) => {
                    const id = typeof item === "object" ? item.id : index + 1;
                    const name = typeof item === "object" ? item.name : item;
                    return (
                      <SelectItem key={id} value={String(id)}>
                        {name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Region Dropdown Field */}
          <Field label="Region" required icon={MapPin}>
            <Select
              value={values.region || ""}
              onValueChange={(val) => onChange("region", val)}
            >
              <SelectTrigger className={cn(inputClass, "w-full")}>
                <SelectValue placeholder="Choose region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((item) => {
                  const name = typeof item === "object" ? item.name : item;
                  const id = typeof item === "object" ? item.id : name;
                  return (
                    <SelectItem key={id} value={name}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground border border-border/50">
              <Info className="size-3.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
              <span>Reach out to a Language Head to modify the regions.</span>
            </div>
          </Field>

          {/* Meanings: Hindi & English */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Meaning in Hindi" required icon={BookOpen}>
              <Textarea
                className={textareaClass}
                placeholder="शब्द का हिंदी में स्पष्ट अर्थ लिखें।"
                value={values.meaning_hindi || values.meaning || ""}
                onChange={(e) => {
                  onChange("meaning_hindi", e.target.value);
                  onChange("meaning", e.target.value);
                }}
              />
            </Field>

            <Field label="Meaning in English" required icon={BookOpen}>
              <Textarea
                className={textareaClass}
                placeholder="Clear meaning and context in English."
                value={values.meaning_english || ""}
                onChange={(e) => onChange("meaning_english", e.target.value)}
              />
            </Field>
          </div>

          {/* Sentence using that word in Pahadi (Devanagari) */}
          <Field
            label="Sentence using that word in Pahadi (Devanagari)"
            required
            icon={Quote}
          >
            <Textarea
              className={textareaClass}
              placeholder="पहाड़ी वाक्य (देवनागरी लिपि में)"
              value={values.example_sentence || ""}
              onChange={(e) => onChange("example_sentence", e.target.value)}
            />
          </Field>

          {/* Sentence Meaning in Hindi */}
          <Field label="Sentence Meaning in Hindi" required icon={BookOpen}>
            <Textarea
              className={textareaClass}
              placeholder="ऊपर लिखे गए पहाड़ी वाक्य का हिंदी अनुवाद"
              value={values.example_sentence_hindi || ""}
              onChange={(e) =>
                onChange("example_sentence_hindi", e.target.value)
              }
            />
          </Field>
        </FormSection>

        {/* SECTION 2: OPTIONAL FIELDS */}
        <FormSection
          eyebrow="SECTION 2"
          title="Advanced Metadata Fields"
          description="Phonetics, secondary script variants, and transliterations. These can be auto-generated or left blank."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateWithGrok}
              disabled={isGenerating}
              className="gap-1.5 border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 text-xs font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-2.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Auto-fill with AI
                </>
              )}
            </Button>
          }
        >
          {grokError && (
            <div className="p-3 text-xs rounded-md bg-destructive/10 border border-destructive/20 text-destructive font-medium">
              {grokError}
            </div>
          )}

          {/* Word in Latin, Takri & IPA */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              label="Word in Latin"
              helper="Phonetic transliteration syntax."
              icon={SpellCheck}
            >
              <Input
                className={cn(inputClass, "font-mono")}
                placeholder="e.g., pāṇī"
                value={values.word_latin || ""}
                onChange={(e) => onChange("word_latin", e.target.value)}
              />
            </Field>

            <Field label="Word in Takri" icon={Type}>
              <Input
                className={inputClass}
                placeholder="𑚛𑚮𑚟𑚄𑚯𑚹"
                value={(values as any).word_takri || ""}
                onChange={(e) => onChange("word_takri" as any, e.target.value)}
              />
            </Field>

            <Field label="IPA Phonetics" icon={SpellCheck}>
              <Input
                className={cn(inputClass, "font-mono")}
                placeholder="e.g., /ɟʱaːkəɽiː/"
                value={values.ipa || ""}
                onChange={(e) => onChange("ipa", e.target.value)}
              />
            </Field>
          </div>

          {/* Sentence in Latin */}
          <Field label="Sentence in Latin" icon={Quote}>
            <Textarea
              className={textareaClass}
              placeholder="Write the phonetic Romanised version of the Pahadi example sentence."
              value={
                (values as any).example_sentence_latin ||
                values.example_sentence_english ||
                ""
              }
              onChange={(e) => {
                onChange("example_sentence_latin" as any, e.target.value);
                onChange("example_sentence_english", e.target.value);
              }}
            />
          </Field>

          {/* Sentence in Takri */}
          <Field label="Sentence in Takri" icon={Quote}>
            <Textarea
              className={textareaClass}
              placeholder="Write the historical Takri script transcription of the example sentence."
              value={(values as any).example_sentence_takri || ""}
              onChange={(e) =>
                onChange("example_sentence_takri" as any, e.target.value)
              }
            />
          </Field>
        </FormSection>
      </div>

      {/* CORE REQUIREMENT CHECKLIST */}
      <aside className="h-fit rounded-lg border bg-card p-5 lg:sticky lg:top-6">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              CORE REQUIREMENT CHECKLIST
            </p>
            <h3 className="mt-1 text-sm font-bold text-foreground">
              Core Section Readiness
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              All mandatory fields must be fulfilled before submitting entry for
              evaluation.
            </p>
          </div>

          <div className="space-y-1.5 text-xs">
            <ReadinessItem
              label="Dialect Choice"
              complete={isFieldComplete("dialect_name")}
            />
            <ReadinessItem
              label="Word (Devanagari)"
              complete={isFieldComplete("word_devanagari")}
            />
            <ReadinessItem
              label="Category Selected"
              complete={isFieldComplete("category_id")}
            />
            <ReadinessItem
              label="Part of Speech Set"
              complete={isFieldComplete("part_of_speech_id" as any)}
            />
            <ReadinessItem
              label="Region Inputted"
              complete={isFieldComplete("region")}
            />
            <ReadinessItem
              label="Hindi Meaning Given"
              complete={isFieldComplete("meaning_hindi")}
            />
            <ReadinessItem
              label="English Meaning Given"
              complete={isFieldComplete("meaning_english")}
            />
            <ReadinessItem
              label="Pahadi Phrase"
              complete={isFieldComplete("example_sentence")}
            />
            <ReadinessItem
              label="Phrase Translation (Hindi)"
              complete={isFieldComplete("example_sentence_hindi")}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function FormSection({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="border-b pb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required = false,
  helper,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  icon?: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {helper && <p className="text-[11px] text-muted-foreground">{helper}</p>}
    </div>
  );
}

function ReadinessItem({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background/50 px-3 py-2">
      <span className="font-medium text-foreground">{label}</span>
      <span
        className={cn(
          "size-2 rounded-full transition-colors",
          complete
            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            : "bg-muted-foreground/30"
        )}
      />
    </div>
  );
}