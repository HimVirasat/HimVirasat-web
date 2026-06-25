"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Contribution } from "@/types/admin/FSM/contribution-rules";
import {
  MapPin,
  Tags,
  Type,
  Languages,
  SpellCheck,
  BookOpen,
} from "lucide-react";

interface FormFieldsProps {
  values: Partial<Contribution>;
  onChange: (field: keyof Contribution, value: any) => void;
}

export function SubmissionFormFields({ values, onChange }: FormFieldsProps) {
  // Container no longer manages internal padding or heights—just borders and shared background
  const structuralInputGroup =
    "w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus-within:border-neutral-900 dark:focus-within:border-neutral-100 focus-within:ring-1 focus-within:ring-neutral-900 dark:focus-within:ring-neutral-100 transition-all duration-150 rounded-xl overflow-hidden flex items-center";

  // Base style completely flushes edge-to-edge and sets native padding to fill the background space
  const inputStyle =
    "w-full border-none bg-transparent shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-neutral-100";

  const availableDialects = ["Kangri", "Mandeali", "Kullui"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-transparent">
      {/* LEFT COLUMN: Metadata & Classification Context */}
      <div className="lg:col-span-5 space-y-6 bg-transparent">
        <div>
          <h2 className="text-xs uppercase tracking-wider font-mono text-neutral-900 dark:text-neutral-100 font-bold">
            01 / Taxonomy
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Index the structural location of this token.
          </p>
        </div>

        {/* Dialect Selector Segment */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Languages className="size-3.5 text-neutral-400 dark:text-neutral-500" />
            Target Dialect <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {availableDialects.map((dialect) => {
              const isSelected = values.dialect === dialect;
              return (
                <button
                  key={dialect}
                  type="button"
                  onClick={() => onChange("dialect", dialect)}
                  className={cn(
                    "px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 outline-none",
                    isSelected
                      ? "bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 text-white dark:text-neutral-950 shadow-xs"
                      : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600"
                  )}
                >
                  {dialect}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Inputs */}
        <div className="space-y-2">
          <Label
            htmlFor="category"
            className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5"
          >
            <Tags className="size-3.5 text-neutral-400 dark:text-neutral-500" />{" "}
            Category
          </Label>
          <div className={structuralInputGroup}>
            <Input
              id="category"
              className={cn("h-11 px-4 text-xs font-medium", inputStyle)}
              placeholder="e.g., Flora, Kinship, Architecture"
              value={values.category || ""}
              onChange={(e) => onChange("category", e.target.value)}
            />
          </div>
        </div>

        {/* Geographic Sub-Region Info */}
        <div className="space-y-2">
          <Label
            htmlFor="region"
            className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5"
          >
            <MapPin className="size-3.5 text-neutral-400 dark:text-neutral-500" />{" "}
            Linguistic Region
          </Label>
          <div className={structuralInputGroup}>
            <Input
              id="region"
              className={cn("h-11 px-4 text-xs font-medium", inputStyle)}
              placeholder="e.g., Upper Mandi Valley, Chamba Border"
              value={values.region || ""}
              onChange={(e) => onChange("region", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: The Composition Desk */}
      <div className="lg:col-span-7 space-y-8 bg-transparent">
        {/* Phonetics Split Box */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xs uppercase tracking-wider font-mono text-neutral-900 dark:text-neutral-100 font-bold">
              02 / Additional Fields
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="word_devanagari"
                className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5"
              >
                <Type className="size-3 text-neutral-400 dark:text-neutral-500" />{" "}
                Native Devanagari <span className="text-destructive">*</span>
              </Label>
              <div className={structuralInputGroup}>
                <Input
                  id="word_devanagari"
                  className={cn(
                    "h-11 px-4 text-sm font-bold tracking-wide",
                    inputStyle
                  )}
                  placeholder="पानी"
                  value={values.word_devanagari || ""}
                  onChange={(e) => onChange("word_devanagari", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="word_latin"
                className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5"
              >
                <SpellCheck className="size-3 text-neutral-400 dark:text-neutral-500" />{" "}
                Latin Transliteration
              </Label>
              <div className={structuralInputGroup}>
                <Input
                  id="word_latin"
                  className={cn(
                    "h-11 px-4 text-xs italic font-medium tracking-wide",
                    inputStyle
                  )}
                  placeholder="pānī"
                  value={values.word_latin || ""}
                  onChange={(e) => onChange("word_latin", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="ipa"
              className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5"
            >
              <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 px-1.5 py-0.5 rounded font-mono select-none">
                IPA
              </span>{" "}
              International Phonetic Alphabet
            </Label>
            <div className={structuralInputGroup}>
              <Input
                id="ipa"
                className={cn(
                  "h-11 px-4 font-mono text-xs tracking-wider",
                  inputStyle
                )}
                placeholder="/pɑːniː/"
                value={values.ipa || ""}
                onChange={(e) => onChange("ipa", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Semantics & Narrative Context Fields */}
        <div className="space-y-4 pt-2">
          <div>
            <h2 className="text-xs uppercase tracking-wider font-mono text-neutral-900 dark:text-neutral-100 font-bold">
              03 / Semantic Architecture
            </h2>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="meaning"
              className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5"
            >
              <BookOpen className="size-3.5 text-neutral-400 dark:text-neutral-500" />{" "}
              Definitional Scope <span className="text-destructive">*</span>
            </Label>
            <div className={structuralInputGroup}>
              <Textarea
                id="meaning"
                className={cn(
                  "min-h-[110px] text-xs leading-relaxed resize-none p-4",
                  inputStyle
                )}
                placeholder="Dissect semantics, connotations, archaic applications, and native idioms..."
                value={values.meaning || ""}
                onChange={(e) => onChange("meaning", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="example_sentence"
              className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5"
            >
              <Type className="size-3.5 text-neutral-400 dark:text-neutral-500" />{" "}
              Structural Oral Example{" "}
              <span className="text-destructive">*</span>
            </Label>
            <div className={structuralInputGroup}>
              <Textarea
                id="example_sentence"
                className={cn(
                  "min-h-[85px] text-xs leading-relaxed font-medium tracking-wide resize-none p-4",
                  inputStyle
                )}
                placeholder="Transcribe how this vocabulary element is spoken organically within sentences..."
                value={values.example_sentence || ""}
                onChange={(e) => onChange("example_sentence", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
