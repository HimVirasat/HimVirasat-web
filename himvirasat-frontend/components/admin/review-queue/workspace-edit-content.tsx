"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataLookupService } from "@/lib/services/admin/datalookup-service";
import { Contribution } from "@himvirasat/shared";

interface WorkspaceEditContentProps {
  editForm: Partial<Contribution>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Contribution>>>;
}

export default function WorkspaceEditContent({
  editForm,
  setEditForm,
}: WorkspaceEditContentProps) {
  const { data: dialects = [] } = useQuery({
    queryKey: ["lookup-dialects"],
    queryFn: DataLookupService.getAvailableDialects,
    staleTime: 10 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["lookup-categories"],
    queryFn: DataLookupService.getAvailableCategories,
    staleTime: 10 * 60 * 1000,
  });

  const { data: partsOfSpeech = [] } = useQuery({
    queryKey: ["lookup-pos"],
    queryFn: DataLookupService.getAvailablePartsOfSpeech,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Devanagari Root Script
          </label>
          <Input
            value={editForm.word_devanagari || ""}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                word_devanagari: e.target.value,
              }))
            }
            className="font-bold text-lg bg-background border-border text-foreground"
          />
        </div>

        {/* Dynamic Select for Part of Speech */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Part of Speech
          </label>
          <Select
            value={
              editForm.part_of_speech_name ||
              editForm.part_of_speech_id?.toString() ||
              undefined
            }
            onValueChange={(val) =>
              setEditForm((prev) => ({
                ...prev,
                part_of_speech_name: val,
                // If lookup objects with IDs are available, pass part_of_speech_id here as well
              }))
            }
          >
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue placeholder="Select Part of Speech" />
            </SelectTrigger>
            <SelectContent>
              {partsOfSpeech.map((pos: any) => {
                const name = typeof pos === "string" ? pos : pos.name;
                const key = typeof pos === "string" ? pos : pos.id;
                return (
                  <SelectItem key={key} value={name}>
                    {name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Select for Dialect */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Dialect Variant
          </label>
          <Select
            value={
              editForm.dialect_name ||
              editForm.dialect_id?.toString() ||
              undefined
            }
            onValueChange={(val) =>
              setEditForm((prev) => ({
                ...prev,
                dialect_name: val,
              }))
            }
          >
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue placeholder="Select Dialect" />
            </SelectTrigger>
            <SelectContent>
              {dialects.map((d: any) => {
                const name = typeof d === "string" ? d : d.name;
                const key = typeof d === "string" ? d : d.id;
                return (
                  <SelectItem key={key} value={name}>
                    {name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Select for Category */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Category
          </label>
          <Select
            value={
              editForm.category_name ||
              editForm.category_id?.toString() ||
              undefined
            }
            onValueChange={(val) =>
              setEditForm((prev) => ({
                ...prev,
                category_name: val,
              }))
            }
          >
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat: any) => {
                const name = typeof cat === "string" ? cat : cat.name;
                const key = typeof cat === "string" ? cat : cat.id;
                return (
                  <SelectItem key={key} value={name}>
                    {name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Latin Text
          </label>
          <Input
            value={editForm.word_latin || ""}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, word_latin: e.target.value }))
            }
            className="font-mono bg-background border-border text-foreground"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Word in Takri
          </label>
          <Input
            value={editForm.word_takri || ""}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, word_takri: e.target.value }))
            }
            className="font-mono bg-background border-border text-foreground"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            International Phonetic Alphabet (IPA)
          </label>
          <Input
            value={editForm.ipa || ""}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, ipa: e.target.value }))
            }
            className="font-mono max-w-sm bg-background border-border text-foreground"
          />
        </div>
      </div>

      <div className="space-y-4 border-b border-border/40 pb-6">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Detailed Dialect Meaning
          </label>
          <Textarea
            value={editForm.meaning || ""}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, meaning: e.target.value }))
            }
            className="min-h-20 bg-background border-border text-foreground"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 dark:bg-muted/10 p-4 rounded-xl border border-border/40">
          <EditInput
            label="Hindi Cross-Mapping Index"
            value={editForm.meaning_hindi}
            onChange={(val) =>
              setEditForm((prev) => ({ ...prev, meaning_hindi: val }))
            }
          />
          <EditInput
            label="English Equivalent"
            value={editForm.meaning_english}
            onChange={(val) =>
              setEditForm((prev) => ({ ...prev, meaning_english: val }))
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Usage Validation Context Sentences
        </h4>
        <div className="p-4.5 rounded-xl bg-muted/20 border border-border space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase block">
              Dialect Sentence
            </label>
            <Input
              value={editForm.example_sentence || ""}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  example_sentence: e.target.value,
                }))
              }
              className="bg-background text-foreground"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <EditInput
              label="Latin Sentence"
              value={editForm.example_sentence_latin}
              onChange={(val) =>
                setEditForm((prev) => ({
                  ...prev,
                  example_sentence_latin: val,
                }))
              }
            />
            <EditInput
              label="Takri Sentence"
              value={editForm.example_sentence_takri}
              onChange={(val) =>
                setEditForm((prev) => ({
                  ...prev,
                  example_sentence_takri: val,
                }))
              }
            />
            <EditInput
              label="English Sentence"
              value={editForm.example_sentence_english}
              onChange={(val) =>
                setEditForm((prev) => ({
                  ...prev,
                  example_sentence_english: val,
                }))
              }
            />
            <EditInput
              label="Hindi Sentence"
              value={editForm.example_sentence_hindi}
              onChange={(val) =>
                setEditForm((prev) => ({
                  ...prev,
                  example_sentence_hindi: val,
                }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EditInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string | null;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
        {label}
      </label>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background text-foreground border-border"
      />
    </div>
  );
}
