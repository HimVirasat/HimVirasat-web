"use client";

import { useState } from "react";
import { devToTankri } from "@/lib/transliteration/devToTankri";
import { tankriToDev } from "@/lib/transliteration/tankriToDev";

export default function Transliterator() {
  const [devText, setDevText] = useState("");
  const [tankriText, setTankriText] = useState("");
  const [lastEdited, setLastEdited] = useState<"dev" | "tankri" | null>(null);

  const handleDevChange = (value: string) => {
    setLastEdited("dev");
    setDevText(value);
    setTankriText(devToTankri(value));
  };

  const handleTankriChange = (value: string) => {
    setLastEdited("tankri");
    setTankriText(value);
    setDevText(tankriToDev(value));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto glass rounded-2xl p-6 md:p-8 shadow">
      <h2 className="text-2xl font-semibold">Transliteration Tool</h2>

      <p className="mt-2 text-sm opacity-70 max-w-xl">
        Type in either box. The other will update automatically.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Devanagari */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Devanagari</label>
          <textarea
            value={devText}
            onChange={(e) => handleDevChange(e.target.value)}
            placeholder="Type Devanagari here..."
            className="h-40 rounded-lg border p-3 bg-white/70 dark:bg-zinc-900/70 resize-none focus:outline-none"
          />
          <button
            onClick={() => copyToClipboard(devText)}
            className="mt-2 text-sm px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 self-start"
          >
            Copy
          </button>
        </div>

        {/* Tankri */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Tankri</label>
          <textarea
            value={tankriText}
            onChange={(e) => handleTankriChange(e.target.value)}
            placeholder="Type Tankri here..."
            className="h-40 rounded-lg border p-3 bg-white/70 dark:bg-zinc-900/70 resize-none focus:outline-none"
          />
          <button
            onClick={() => copyToClipboard(tankriText)}
            className="mt-2 text-sm px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 self-start"
          >
            Copy
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs opacity-60">
        This is a basic transliteration tool. Please verify outputs before
        using.
      </p>
    </div>
  );
}
