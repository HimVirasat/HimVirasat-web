import Link from "next/link";
import Image from "next/image";
import DialectLink from "@/components/DialectLink";
import { dialectsConfig } from "@/lib/dialect-utils"; // Import the config

export default function VocabularyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100">
      <div className="absolute inset-0">
        <Image
          src="/mountains1.png"
          alt="Mountain background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-white/60 dark:bg-black/85" />

      <main className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-5xl px-6 sm:px-10">
          <span className="uppercase tracking-widest text-xs opacity-70 font-semibold">
            Language & Culture
          </span>

          <h1 className="mt-2 text-4xl md:text-5xl font-semibold">
            Vocabulary
          </h1>

          <p className="mt-4 text-lg max-w-xl opacity-80 leading-relaxed">
            Explore Himachali dialects, their vocabulary, expressions, and
            cultural meanings preserved from the hills.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
            {dialectsConfig.map((dialect) => (
              <DialectLink
                key={dialect.id}
                href={`/vocabulary/${dialect.id}`}
                title={dialect.title}
                subtitle={dialect.subtitle}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
