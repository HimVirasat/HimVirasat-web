"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Eyebrow } from "@/components/mistral/eyebrow";
import { PixelIcon } from "@/components/mistral/pixel-icon";
import { Button } from "@/components/ui/button";
import { devToTankri } from "@/lib/transliteration/devToTankri";
import { tankriToDev } from "@/lib/transliteration/tankriToDev";
import { cn } from "@/lib/utils";

const EXAMPLES = ["नमस्ते", "हिमाचल", "पहाड़", "मंडी"];

// The pane itself is the ruled cell, so the field carries no border of its
// own — the hairline grid supplies all the structure.
const fieldBase =
  "w-full flex-1 resize-y bg-transparent outline-none placeholder:text-muted-foreground min-h-40 md:min-h-52";

export default function Transliterator() {
  const [devText, setDevText] = useState("");
  const [tankriText, setTankriText] = useState("");
  const [swapped, setSwapped] = useState(false);

  const handleDevChange = (value: string) => {
    setDevText(value);
    setTankriText(devToTankri(value));
  };

  const handleTankriChange = (value: string) => {
    setTankriText(value);
    setDevText(tankriToDev(value));
  };

  const copyText = async (text: string, script: "Devanagari" | "Takri") => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied ${script} text`);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const clearAll = () => {
    setDevText("");
    setTankriText("");
  };

  const bothEmpty = devText === "" && tankriText === "";

  return (
    <div className="border-border border">
      <div className="bg-border grid gap-px md:grid-cols-2">
        <div
          className={cn(
            "ruled-cell flex flex-col gap-3 p-6",
            swapped ? "md:order-2" : "md:order-1",
          )}
        >
          <div className="flex items-center gap-2">
            <Eyebrow nativeEcho="देवनागरी">Devanagari</Eyebrow>
            <span className="text-body-sm text-muted-foreground ml-auto tabular-nums">
              {devText.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={devText === ""}
              onClick={() => copyText(devText, "Devanagari")}
            >
              Copy
            </Button>
          </div>
          <textarea
            value={devText}
            onChange={(e) => handleDevChange(e.target.value)}
            placeholder="यहाँ लिखें…"
            aria-label="Devanagari text"
            className={cn(fieldBase, "font-deva text-lg")}
          />
        </div>

        <div
          className={cn(
            "ruled-cell flex flex-col gap-3 p-6",
            swapped ? "md:order-1" : "md:order-2",
          )}
        >
          <div className="flex items-center gap-2">
            <Eyebrow nativeEcho="𑚔𑚭𑚊𑚤𑚯">Takri</Eyebrow>
            <span className="text-body-sm text-muted-foreground ml-auto tabular-nums">
              {tankriText.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={tankriText === ""}
              onClick={() => copyText(tankriText, "Takri")}
            >
              Copy
            </Button>
          </div>
          <textarea
            value={tankriText}
            onChange={(e) => handleTankriChange(e.target.value)}
            placeholder="Takri output…"
            aria-label="Takri text"
            className={cn(fieldBase, "font-takri text-xl leading-relaxed")}
          />
        </div>
      </div>

      <div className="border-border flex flex-wrap items-center gap-2 border-t p-4">
        <Button variant="secondary" size="sm" onClick={() => setSwapped((s) => !s)}>
          <PixelIcon
            name="swap"
            className={cn("size-4 transition-transform", swapped && "rotate-180")}
          />
          Swap panes
        </Button>
        <Button variant="ghost" size="sm" disabled={bothEmpty} onClick={clearAll}>
          Clear
        </Button>

        <span className="text-body-sm text-muted-foreground ml-auto">Try:</span>
        {EXAMPLES.map((word) => (
          <button
            key={word}
            type="button"
            lang="hi"
            onClick={() => handleDevChange(word)}
            className="border-border font-deva hover:bg-secondary rounded-md border px-3 py-1 text-sm transition-colors"
          >
            {word}
          </button>
        ))}
      </div>

      <p className="text-body-sm text-muted-foreground border-border border-t px-4 py-3">
        This is a basic transliteration tool. Please verify outputs before use.
      </p>
    </div>
  );
}
