import Image from "next/image";
import DialectLink from "@/components/DialectLink";

export default function ToolsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Background */}
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

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/60 dark:bg-black/85" />

      {/* Content */}
      <main className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-5xl px-6 sm:px-10">
          <span className="uppercase tracking-widest text-xs opacity-70 font-semibold">
            Tools
          </span>

          <h1 className="mt-2 text-4xl md:text-5xl font-semibold">
            Tools
          </h1>

          <p className="mt-4 text-lg max-w-xl opacity-80 leading-relaxed">
            Utility tools to assist contributors in working with scripts,
            datasets, and language preservation tasks.
          </p>

          {/* Tools Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
            <DialectLink
              href="/tools/transliterator"
              title="Transliterator"
              subtitle="Convert between Devanagari and Tankri scripts."
            />
          </div>
        </div>
      </main>
    </div>
  );
}