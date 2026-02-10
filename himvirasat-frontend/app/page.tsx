import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const actionButtonClass =
  "h-14 gap-3 rounded-full px-6 text-sm font-medium " +
  "bg-white/95 text-gray-900 " +
  "dark:bg-zinc-900 dark:text-zinc-100 " +
  "shadow-sm ring-1 ring-black/10 dark:ring-white/10 " +
  "backdrop-blur-sm transition " +
  "hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/mountains1.png')" }}
      />
      <div className="absolute inset-0 bg-white/45 dark:bg-black/60" />

      <main className="relative mx-auto min-h-screen max-w-4xl px-6 py-24 sm:px-12">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/virasat.png"
            alt="HimVirasat logo"
            width={84}
            height={84}
            priority
            className="rounded-2xl"
          />

          <h1 className="mt-6 bg-linear-to-r from-emerald-700 via-green-700 to-amber-600 bg-clip-text text-5xl font-semibold tracking-tight text-transparent">
            HimVirasat
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-800 dark:text-zinc-200">
            A community-driven initiative to preserve Himachal Pradesh’s
            languages, dialects, traditions, and cultural memory — and bring
            them into the digital age.
          </p>
        </div>

        <section className="mt-16 rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur dark:bg-zinc-900/70">
          <h2 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-400">
            Open Translation Datasets for Himachali Dialects
          </h2>

          <p className="mt-4 text-base leading-7 text-zinc-700 dark:text-zinc-300">
            We are building open, structured Hindi ↔ Himachali dialect translation datasets by collecting parallel sentences written by native speakers.
            Contributors simply write everyday sentences in their dialect along with Hindi translations. No technical knowledge required.
          </p>

          <p className="mt-4 text-base leading-7 text-zinc-700 dark:text-zinc-300">
            These datasets will be freely available for research and used to fine-tune multilingual AI models, ensuring Himachali languages are not left behind in the digital age.
          </p>
        </section>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button asChild className={actionButtonClass}>
            <Link
              href="https://discord.gg/PgJWcFXRTB"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/virasat.png"
                alt="HimVirasat Discord"
                width={36}
                height={36}
                className="rounded-full"
              />
              Join HimVirasat Discord
            </Link>
          </Button>

          <Button asChild className={actionButtonClass}>
            <Link
              href="https://discord.gg/wHjT3vMAVx"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/hpdiscord.png"
                alt="Himachal Pradesh Discord"
                width={36}
                height={36}
                className="rounded-full"
              />
              Join HP Discord Community
            </Link>
          </Button>

          <Button asChild className={actionButtonClass}>
            <Link
              href="https://github.com/HimVirasat"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/hp-github.png"
                alt="HimVirasat GitHub"
                width={36}
                height={36}
                className="rounded-full"
              />
              HimVirasat GitHub
            </Link>
          </Button>

          <Button asChild className={actionButtonClass}>
            <Link
              href="https://www.reddit.com/r/HimVirasat/" //Reddit link
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/reddit.png"
                alt="Himachal Pradesh Reddit Community"
                width={36}
                height={36}
                className="rounded-full"
              />
              Join HP Reddit
            </Link>
          </Button>

          <Button asChild className={`w-40 ${actionButtonClass}`}>
            <Link href="/contribute">
              <HeartIcon className="h-6 w-6 scale-125 text-red-500 fill-red-500" />
              <span>Contribute</span>
            </Link>
          </Button>
        </div>

        <footer className="mt-20 text-center text-md text-black dark:text-zinc-400">
          HimVirasat is an open, community-driven effort to preserve Himachal’s
          heritage for future generations.
        </footer>
      </main>
    </div>
  );
}
