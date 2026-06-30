import { BackgroundDecor } from "@/components/layout/background-decor";
import DialectLink from "@/components/vocabulary/DialectLink";

export default function ToolsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100">
      <BackgroundDecor overlayClassName="bg-white/60 dark:bg-black/85" />

      <main className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-5xl px-6 sm:px-10">
          <span className="uppercase tracking-widest text-xs opacity-70 font-semibold">
            Tools
          </span>

          <h1 className="mt-2 text-4xl md:text-5xl font-semibold">Tools</h1>

          <p className="mt-4 text-lg max-w-xl opacity-80 leading-relaxed">
            Utility tools to assist contributors in working with scripts,
            datasets, and language preservation tasks.
          </p>

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