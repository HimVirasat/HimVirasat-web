import type { Metadata } from "next";

import { PixelIcon } from "@/components/mistral/pixel-icon";
import { RuledGrid } from "@/components/mistral/ruled-grid";
import { SectionHeading } from "@/components/mistral/section-heading";
import { ToolCard } from "@/components/tools/tool-card";
import { site } from "@/lib/site";
import { devToTankri } from "@/lib/transliteration/devToTankri";

export const metadata: Metadata = {
  title: "Language Tools",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto w-full max-w-content px-6 py-20 md:py-28 lg:px-10">
      <SectionHeading
        as="h1"
        align="left"
        eyebrow="Tools"
        nativeEcho={devToTankri("उपकरण")}
        title="Language tools"
        description="Utilities for working with scripts, datasets, and the day-to-day tasks of language preservation."
      />

      <RuledGrid cols={2} className="mt-14">
        <ToolCard
          href="/tools/transliterator"
          title="Transliterator"
          description="Convert between Devanagari and Takri, the script once used across Himachal."
          glyph="𑚀"
        />

        <a
          href={`${site.links.repo}/issues`}
          target="_blank"
          rel="noreferrer"
          className="ruled-cell hover:bg-secondary group flex h-full flex-col p-8 transition-colors"
        >
          <span
            aria-hidden
            className="bg-secondary border-border mb-6 grid size-14 place-items-center border border-dashed"
          >
            <PixelIcon name="plus" className="text-muted-foreground" />
          </span>
          <h2 className="text-title">Propose a tool</h2>
          <p className="text-body-sm text-muted-foreground mt-2 flex-1">
            Open an issue on GitHub with your idea.
          </p>
          <PixelIcon
            name="arrow-up-right"
            className="text-muted-foreground mt-6 size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </RuledGrid>
    </div>
  );
}
