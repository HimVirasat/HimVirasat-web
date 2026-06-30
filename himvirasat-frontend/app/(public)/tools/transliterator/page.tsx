import { BackgroundDecor } from "@/components/layout/background-decor";
import Transliterator from "@/components/transliterator/Transliterator";

export default function TransliteratorPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100">
      <BackgroundDecor overlayClassName="bg-white/60 dark:bg-black/85" />

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-6xl">
          <span className="uppercase tracking-widest text-xs opacity-70 font-semibold">
            Tools
          </span>

          <h1 className="mt-2 text-4xl md:text-5xl font-semibold">
            Transliteration
          </h1>

          <p className="mt-4 text-lg max-w-xl opacity-80 leading-relaxed">
            Convert text between Devanagari and Tankri scripts for contribution
            and verification.
          </p>

          <div className="mt-10">
            <Transliterator />
          </div>

          <p className="mt-6 text-xs opacity-60 max-w-xl leading-relaxed">
            Tankri characters may not display correctly on some systems due to
            limited font support. If characters appear as blank boxes, please
            install a Unicode font that supports Tankri (e.g., Noto Sans
            Tankri).
          </p>
        </div>
      </main>
    </div>
  );
}