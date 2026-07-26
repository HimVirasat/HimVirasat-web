import type { Metadata } from "next";

import { SectionHeading } from "@/components/mistral/section-heading";
import Transliterator from "@/components/transliterator/Transliterator";

export const metadata: Metadata = {
  title: "Devanagari ⇄ Takri Transliterator",
};

export default function TransliteratorPage() {
  return (
    <div className="mx-auto w-full max-w-content px-6 py-20 md:py-28 lg:px-10">
      <SectionHeading
        as="h1"
        align="left"
        eyebrow="Tools"
        title="Devanagari ⇄ Takri"
        description="Takri served as a chancery script across the western Himalaya before Devanagari replaced it."
      />

      <div className="mt-14">
        <Transliterator />
      </div>

      <p className="text-body-sm text-muted-foreground mt-6 max-w-xl">
        Takri text you copy will need a Takri-capable font in the destination
        app.
      </p>
    </div>
  );
}
