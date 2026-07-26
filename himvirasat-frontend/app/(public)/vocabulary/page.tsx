import type { Metadata } from "next";
import Link from "next/link";

import { PixelIcon } from "@/components/mistral/pixel-icon";
import { RuledGrid } from "@/components/mistral/ruled-grid";
import { SectionHeading } from "@/components/mistral/section-heading";
import { dialectsConfig } from "@/lib/dialects/dialect-config";
import { devToTankri } from "@/lib/transliteration/devToTankri";

export const metadata: Metadata = {
  title: "Himachali Vocabulary",
  description: "Search living dictionaries of Himachali dialects.",
};

export default function VocabularyPage() {
  return (
    <main className="mx-auto w-full max-w-content px-6 py-20 md:py-28 lg:px-10">
      <SectionHeading
        as="h1"
        align="left"
        eyebrow="Vocabulary"
        nativeEcho={devToTankri("शब्दकोश")}
        title="Living dictionaries"
        description="Himachali dialects, their vocabulary, expressions, and the meanings they carry."
      />

      <RuledGrid cols={2} className="mt-14">
        {dialectsConfig.map((dialect) => (
          <Link
            key={dialect.id}
            href={`/vocabulary/${dialect.id}`}
            className="ruled-cell hover:bg-secondary group flex flex-col p-8 transition-colors"
          >
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-title">{dialect.title}</h2>
              {dialect.nativeName && (
                <span
                  aria-hidden
                  className="font-deva text-verdant text-lg"
                >
                  {dialect.nativeName}
                </span>
              )}
            </div>
            <p className="text-body-sm text-muted-foreground mt-2 flex-1">
              {dialect.subtitle}
            </p>
            <PixelIcon
              name="chevron-right"
              className="text-muted-foreground mt-8 size-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        ))}

        <Link
          href="/contribute"
          className="ruled-cell hover:bg-secondary group flex flex-col p-8 transition-colors"
        >
          <h2 className="text-title text-muted-foreground">Your dialect next</h2>
          <p className="text-body-sm text-muted-foreground mt-2 flex-1">
            Contribute sentences to bring your dialect online.
          </p>
          <PixelIcon
            name="chevron-right"
            className="text-muted-foreground mt-8 size-4 transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </RuledGrid>
    </main>
  );
}
