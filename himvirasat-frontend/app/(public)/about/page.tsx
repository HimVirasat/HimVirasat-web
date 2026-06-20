import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TeamSection } from "@/components/about/team-section";
export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/mountains1.png')" }}
      />
      <div className="fixed inset-0 bg-white/70 dark:bg-black/85 -z-10" />

      <main className="max-w-5xl mx-auto px-6 py-24 sm:py-32">
        <header className="space-y-4">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase text-xs">
            Our Vision
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Bridging the gap between <br />
            <span className="text-emerald-600 dark:text-emerald-400 italic">
              Heritage and Innovation.
            </span>
          </h1>
        </header>

        <section className="mt-16 space-y-12">
          <div className="rounded-3xl bg-white/40 dark:bg-white/5 border border-white/20 p-8 backdrop-blur-md">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Beyond Just Words
            </h2>
            <p className="mt-4 text-slate-800 dark:text-zinc-300 leading-relaxed">
              {`HimVirasat isn't just a dictionary; it's a technical ecosystem.`}{" "}
              From maintaining this digital archive to developing
              <strong> open-source Pahadi learning tools</strong>, we are
              building the infrastructure for Himachal’s digital future. Our
              vision scales from{" "}
              <strong>specialized LLMs (Large Language Models)</strong> to
              real-time <strong>dialect translators</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
                Collaborative Engineering
              </h3>
              <p className="text-slate-700 dark:text-zinc-400 text-sm leading-relaxed">
                Currently, we use structured community forms to gather data.
                Soon, we will launch a
                <strong> dedicated contribution platform</strong> developed by
                our community, for our community.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
                Open Learning
              </h3>
              <p className="text-slate-700 dark:text-zinc-400 text-sm leading-relaxed">
                We are committed to creating free tools that help the next
                generation learn their mother tongue, blending traditional
                knowledge with modern AI.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-emerald-600/10 border border-emerald-500/20 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Become Part of the Movement
            </h2>
            <p className="mt-2 text-slate-700 dark:text-zinc-300">
              Whether you are a native speaker, a linguist, or a developer—your
              contribution matters.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                asChild
                className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
              >
                <Link href="/contribute">Contribute Data</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-8 border-slate-300 dark:border-white/20"
              >
                <Link href="https://discord.gg/PgJWcFXRTB" target="_blank">
                  Join Discord
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <section id="team">
          <TeamSection />
        </section>
      </main>
    </div>
  );
}
