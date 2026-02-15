import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className=" border-t border-border/40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        {/* Brand & Mission */}
        <div className="flex flex-col items-start gap-4 md:max-w-sm">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/virasat.png"
              alt="Logo"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-lg font-bold tracking-tighter text-brand">
              HimVirasat
            </span>
          </Link>
          <p className="text-sm leading-6 text-muted-foreground">
            An open-source initiative dedicated to the digital preservation of
            Himachal's linguistic heritage and cultural memory.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 md:mt-0">
          <Link
            href="/vocabulary"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Vocabulary
          </Link>
          <Link
            href="/vocabulary"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dialects
          </Link>
          <Link
            href="https://github.com/HimVirasat"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </div>

        {/* Legal/Credit */}
        <div className="mt-8 md:mt-0">
          <p className="text-xs leading-5 text-muted-foreground">
            &copy; {new Date().getFullYear()} HimVirasat. Built by the
            community.
          </p>
        </div>
      </div>
    </footer>
  );
}
