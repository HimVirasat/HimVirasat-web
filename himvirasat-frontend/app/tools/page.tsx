import Image from "next/image";
import Link from "next/link";

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

          <h1 className="mt-2 text-4xl md:text-5xl font-semibold">Tools</h1>

          <p className="mt-4 text-lg max-w-xl opacity-80 leading-relaxed">
            Utility tools to assist contributors in working with scripts,
            datasets, and language preservation tasks.
          </p>

          {/* Tools Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
            <Link
              href="/tools/transliterator"
              className="rounded-2xl bg-white/90 p-6 shadow dark:bg-zinc-900/80 hover:scale-[1.02] transition"
            >
              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                Transliterator
              </h3>

              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                Convert between Devanagari and Tankri scripts.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
