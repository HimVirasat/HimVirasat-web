"use client";

import type { ElementType, ReactNode } from "react";
import {
  BookOpen,
  Languages,
  MapPin,
  Quote,
  SpellCheck,
  Tags,
  Type,
  FileText,
  PenTool,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SubmissionFormValues } from "@/types/admin/FSM/contribution-rules";

interface FormFieldsProps {
  values: SubmissionFormValues;
  dialects: string[];
  categories: string[];
  partsOfSpeech: string[];
  onChange: <K extends keyof SubmissionFormValues>(
    field: K,
    value: SubmissionFormValues[K]
  ) => void;
}

const inputClass =
  "h-10 rounded-md border-border bg-background text-sm shadow-none";

const textareaClass =
  "min-h-28 rounded-md border-border bg-background text-sm leading-relaxed shadow-none resize-y";

export function SubmissionFormFields({
  values,
  dialects,
  categories,
  partsOfSpeech,
  onChange,
}: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-12">
        {/* Core Section - All Fields Mandatory */}
        <FormSection
          eyebrow="Section 1"
          title="Core Lexical Fields"
          description="All parameters in this primary segment are fully required to form a viable lexical resource entry."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Dialect" required icon={Languages}>
              <Select
                value={values.dialect}
                onValueChange={(value) => onChange("dialect", value)}
              >
                <SelectTrigger className={cn(inputClass, "w-full")}>
                  <SelectValue placeholder="Choose dialect" />
                </SelectTrigger>
                <SelectContent>
                  {dialects.map((dialect) => (
                    <SelectItem key={dialect} value={dialect}>
                      {dialect}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Word in Devanagari" required icon={Type}>
              <Input
                className={cn(inputClass, "font-semibold")}
                placeholder="उदाहरणात्मक शब्द"
                value={values.word_devanagari}
                onChange={(event) =>
                  onChange("word_devanagari", event.target.value)
                }
              />
            </Field>

            <Field label="Category" required icon={Tags}>
              <Select
                value={values.category}
                onValueChange={(value) => onChange("category", value)}
              >
                <SelectTrigger className={cn(inputClass, "w-full")}>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Part of Speech" required icon={FileText}>
              <Select
                value={values.part_of_speech}
                onValueChange={(value) => onChange("part_of_speech", value)}
              >
                <SelectTrigger className={cn(inputClass, "w-full")}>
                  <SelectValue placeholder="Select Part of Speech" />
                </SelectTrigger>
                <SelectContent>
                  {partsOfSpeech.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Region" required icon={MapPin}>
            <Input
              className={inputClass}
              placeholder="e.g., Palampur, Karsog, Bharmour"
              value={values.region}
              onChange={(event) => onChange("region", event.target.value)}
            />
          </Field>

          <Field label="Meaning in Hindi" required icon={BookOpen}>
            <Textarea
              className={cn(textareaClass, "min-h-20")}
              placeholder="शब्द का हिंदी में स्पष्ट अर्थ और संदर्भ लिखें।"
              value={values.meaning_hindi}
              onChange={(event) =>
                onChange("meaning_hindi", event.target.value)
              }
            />
          </Field>

          <Field
            label="Sentence using that word in Pahadi (Devanagari)"
            required
            icon={Quote}
          >
            <Textarea
              className={cn(textareaClass, "min-h-20")}
              placeholder="पहाड़ी वाक्य (देवनागरी लिपि में)"
              value={values.example_sentence}
              onChange={(event) =>
                onChange("example_sentence", event.target.value)
              }
            />
          </Field>

          <Field label="Sentence Meaning in Hindi" required icon={BookOpen}>
            <Textarea
              className={cn(textareaClass, "min-h-20")}
              placeholder="ऊपर लिखे गए पहाड़ी वाक्य का हिंदी अनुवाद"
              value={values.example_sentence_hindi_meaning}
              onChange={(event) =>
                onChange("example_sentence_hindi_meaning", event.target.value)
              }
            />
          </Field>
        </FormSection>

        {/* Advanced Section - Optional Fields */}
        <FormSection
          eyebrow="Section 2"
          title="Advanced Metadata Fields"
          description="Phonetics, secondary script variants, and transliterations. These can be left blank."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Word in Latin"
              helper="Take care of phonetics syntax."
              icon={SpellCheck}
            >
              <Input
                className={cn(inputClass, "font-mono")}
                placeholder="e.g., pāṇī"
                value={values.word_latin}
                onChange={(event) => onChange("word_latin", event.target.value)}
              />
            </Field>

            <Field label="Word in Takri" icon={PenTool}>
              <Input
                className={inputClass}
                placeholder="𑚧mfeatures"
                value={values.word_takri}
                onChange={(event) => onChange("word_takri", event.target.value)}
              />
            </Field>
          </div>

          <Field label="Sentence in Latin" icon={Quote}>
            <Textarea
              className={cn(textareaClass, "min-h-20")}
              placeholder="Write the phonetic Romanised version of the Pahadi example sentence."
              value={values.example_sentence_latin}
              onChange={(event) =>
                onChange("example_sentence_latin", event.target.value)
              }
            />
          </Field>

          <Field label="Sentence in Takri" icon={Quote}>
            <Textarea
              className={cn(textareaClass, "min-h-20")}
              placeholder="Write the historical Takri script transcription of the example sentence."
              value={values.example_sentence_takri}
              onChange={(event) =>
                onChange("example_sentence_takri", event.target.value)
              }
            />
          </Field>
        </FormSection>
      </div>

      {/* Dynamic Checklist Tracker Box */}
      <aside className="lg:sticky lg:top-6 h-fit rounded-lg border bg-muted/20 p-4">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Core Requirement Checklist
            </p>
            <h3 className="mt-1 text-sm font-bold text-foreground">
              Core Section Readiness
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              All Core configurations must illuminate green before submitting
              your record to evaluation.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <ReadinessItem
              label="Dialect Choice"
              complete={Boolean(values.dialect)}
            />
            <ReadinessItem
              label="Word (Devanagari)"
              complete={Boolean(values.word_devanagari)}
            />
            <ReadinessItem
              label="Category Selected"
              complete={Boolean(values.category)}
            />
            <ReadinessItem
              label="Part of Speech Set"
              complete={Boolean(values.part_of_speech)}
            />
            <ReadinessItem
              label="Region Inputted"
              complete={Boolean(values.region.trim())}
            />
            <ReadinessItem
              label="Hindi Meaning Given"
              complete={Boolean(values.meaning_hindi.trim())}
            />
            <ReadinessItem
              label="Pahadi Phrase"
              complete={Boolean(values.example_sentence.trim())}
            />
            <ReadinessItem
              label="Phrase translation"
              complete={Boolean(values.example_sentence_hindi_meaning.trim())}
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
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="border-b pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-base font-bold text-foreground">{title}</h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
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
    <div className="space-y-2">
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
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2">
      <span className="font-medium text-foreground">{label}</span>
      <span
        className={cn(
          "size-2 rounded-full",
          complete ? "bg-emerald-500" : "bg-muted-foreground/30"
        )}
      />
    </div>
  );
}
