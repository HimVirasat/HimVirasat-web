import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import {
  dialectToBackground,
  availableDialectsArray,
} from "@/lib/dialects/dialect-config";
import VocabularySearch from "@/components/vocabulary/VocabularySearch";

function VocabularySearchSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex gap-3 justify-center">
        <div className="flex-1 max-w-2xl h-14 bg-white/10 rounded-xl animate-pulse" />
        <div className="h-14 w-24 bg-white/10 rounded-xl animate-pulse" />
      </div>

      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-28 bg-white/10 rounded-xl animate-pulse" />
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

  const background = dialectToBackground[dialect];

  return (
    <div className="relative min-h-screen text-slate-100 pt-10">
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <Image
          src={background}
          alt={`${dialect} background`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      <div className="fixed inset-0 -z-10 bg-black/30" />

      <main className="min-h-screen flex justify-center px-4 md:px-6 py-12">
        <div className="w-full max-w-5xl bg-black/50 rounded-2xl p-6 md:p-10 border border-white/10 backdrop-blur-md">
          <header className="mb-10">
            <span className="uppercase tracking-widest text-xs text-emerald-400 font-bold">
              Himachali Dialect
            </span>
            <h1 className="mt-2 text-4xl md:text-5xl font-semibold capitalize tracking-tight">
              {dialect}
            </h1>
            <p className="mt-4 text-slate-300 text-lg leading-relaxed">
              Explore the vocabulary and cultural expressions of{" "}
              <span className="text-white font-medium">{dialect}</span>.
            </p>
          </header>

          <Suspense fallback={<VocabularySearchSkeleton />}>
            <VocabularySearch dialect={dialect} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
