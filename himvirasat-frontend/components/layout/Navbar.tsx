"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SiGithub } from "@icons-pack/react-simple-icons";

// TOGGLE THIS TO SWITCH MODES:
// false = Shrinking Floating Pill
// true  = Strict Sticky Bar
const STRICT_STICKY = false;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Vocabulary", href: "/vocabulary" },
    { name: "Tools", href: "/tools" }, // ← ADD THIS
    { name: "Contribute", href: "/contribute" },
    { name: "About", href: "/about" },
  ];

  const headerClasses = STRICT_STICKY
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
      ? "bg-white/85 dark:bg-zinc-950/90 backdrop-blur-md border-b border-border/40 py-2"
      : "bg-transparent py-4"
    }`
    : `fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${isScrolled ? "top-2 w-[88%] max-w-4xl" : "top-2 w-[92%] max-w-5xl"
    }`;

  const navClasses = STRICT_STICKY
    ? "mx-auto max-w-7xl px-6 flex items-center justify-between"
    : `glass bg-white/85 dark:bg-zinc-950/90 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-between ${isScrolled ? "px-6 py-2 shadow-xl" : "px-8 py-4 shadow-lg"
    }`;

  return (
    <header className={headerClasses}>
      <nav className={navClasses}>
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/virasat.png"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-lg transition-transform group-hover:scale-110"
          />
          <span className="text-xl font-semibold tracking-tighter text-black dark:text-white">
            HimVirasat
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="https://github.com/HimVirasat"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="HimVirasat GitHub"
            className="relative p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all duration-300"
          >
            <SiGithub className="h-5 w-5" />
          </Link>
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`
                  relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${isActive
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                    }
                `}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </ul>




        </div>


        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:bg-foreground/5 rounded-full transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div
        className={`
          md:hidden absolute left-1/2 -translate-x-1/2 w-[95%]
          bg-white/85 dark:bg-zinc-950/95 backdrop-blur-md
          rounded-3xl p-6 shadow-2xl transition-all duration-300 origin-top
          ${STRICT_STICKY ? "top-16" : "top-14"}
          ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        <div className="flex flex-col gap-4 text-center">
          {navLinks.map((link) => (

            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium py-2 hover:text-emerald-600 transition-colors"
            >
              {link.name}
            </Link>

          ))}
          <Link
            href="https://github.com/HimVirasat"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            aria-label="HimVirasat GitHub"

            className="flex justify-center pt-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <SiGithub className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}
