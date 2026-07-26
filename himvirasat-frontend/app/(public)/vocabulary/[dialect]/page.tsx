import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SectionHeading } from "@/components/mistral/section-heading";
import VocabularySearch from "@/components/vocabulary/VocabularySearch";
import {
  availableDialectsArray,
  dialectsConfig,
} from "@/lib/dialects/dialect-config";
import { devToTankri } from "@/lib/transliteration/devToTankri";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function generateStaticParams() {
  return availableDialectsArray.map((dialect) => ({ dialect }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dialect: string }>;
}): Promise<Metadata> {
  const { dialect } = await params;
  return { title: `${capitalize(dialect)} Vocabulary` };
}

function VocabularySearchSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="bg-muted h-14 max-w-2xl animate-pulse rounded-md" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-muted h-28 animate-pulse" />
      ))}
    </div>
  );
}

export default async function DialectPage({
  params,
}: {
  params: Promise<{ dialect: string }>;
}) {
  const { dialect } = await params;

  if (!availableDialectsArray.includes(dialect)) {
    notFound();
  }

  const config = dialectsConfig.find((d) => d.id === dialect);

  return (
    <main className="mx-auto w-full max-w-content px-6 py-20 md:py-28 lg:px-10">
      <header>
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="Vocabulary"
          title={config?.title ?? capitalize(dialect)}
          nativeEcho={
            config?.nativeName ? devToTankri(config.nativeName) : undefined
          }
          description={`Explore the vocabulary and cultural expressions of ${config?.title ?? capitalize(dialect)}.`}
        />
      </header>

      <div className="mt-10">
        <Suspense fallback={<VocabularySearchSkeleton />}>
          <VocabularySearch dialect={dialect} />
        </Suspense>
      </div>
    </main>
  );
}
