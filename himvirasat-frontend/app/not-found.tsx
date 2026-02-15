import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/mountains1.png')" }}
      />
      <div className="absolute inset-0 bg-white/40 dark:bg-black/70 backdrop-blur-[2px]" />

      <main className="relative z-10 text-center px-6">
        <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase text-sm">
          Error 404
        </span>
        <h1 className="mt-4 text-6xl md:text-8xl font-bold text-slate-900 dark:text-white tracking-tighter">
          Lost in the <br /> Clouds?
        </h1>
        <p className="mt-6 text-lg text-slate-700 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          The trail you're looking for doesn't exist. It might have been moved
          or renamed in our heritage archives.
        </p>

        <div className="mt-10">
          <Button
            asChild
            className="h-14 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-xl transition-all hover:scale-105"
          >
            <Link href="/">Return to Basecamp</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
