"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ArrowRow } from "@/components/mistral/arrow-row";
import { Eyebrow } from "@/components/mistral/eyebrow";
import { LogoMark } from "@/components/mistral/logo-mark";
import { MegaMenu, type MenuPanel } from "@/components/mistral/mega-menu";
import { PixelIcon } from "@/components/mistral/pixel-icon";
import { Button } from "@/components/ui/button";
import { dialectsConfig } from "@/lib/dialects/dialect-config";
import { site } from "@/lib/site";

const panels: MenuPanel[] = [
  {
    label: "Explore",
    groups: [
      {
        heading: "Archive",
        links: [
          {
            label: "Vocabulary",
            href: "/vocabulary",
            description: "Search living dictionaries by dialect.",
          },
          {
            label: "Datasets",
            href: "/datasets",
            description: "Open, versioned translation data.",
          },
        ],
      },
      {
        heading: "Dialects",
        // Derived from the live config, so the menu can never advertise a
        // dialect that has no vocabulary behind it.
        links: dialectsConfig.map((dialect) => ({
          label: dialect.title,
          href: `/vocabulary/${dialect.id}`,
          description: dialect.subtitle,
        })),
      },
    ],
  },
  {
    label: "Tools",
    groups: [
      {
        heading: "Script",
        links: [
          {
            label: "Transliterator",
            href: "/tools/transliterator",
            description: "Convert Devanagari to Takri and back.",
          },
        ],
      },
      {
        heading: "Contribute",
        links: [
          {
            label: "Start contributing",
            href: "/contribute",
            description: "Add sentences in your dialect.",
          },
          {
            label: "All tools",
            href: "/tools",
            description: "Everything built so far.",
          },
        ],
      },
    ],
  },
  {
    label: "About",
    groups: [
      {
        heading: "Project",
        links: [
          {
            label: "About HimVirasat",
            href: "/about",
            description: "Why this archive exists.",
          },
          {
            label: "Team",
            href: "/about#team",
            description: "Who maintains it.",
          },
          {
            label: "Source code",
            href: site.links.repo,
            description: "Open on GitHub.",
            external: true,
          },
        ],
      },
      {
        heading: "Community",
        links: [
          {
            label: "HimVirasat Discord",
            href: site.links.discordHimvirasat,
            description: "Contributors and maintainers.",
            external: true,
          },
          {
            label: "HP Community Discord",
            href: site.links.discordHpCommunity,
            description: "The wider Himachal community.",
            external: true,
          },
        ],
      },
    ],
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Nothing inside the overlay unmounts on navigation, so close it here.
  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <header className="border-border bg-background fixed inset-x-0 top-0 z-50 border-b">
      <nav className="flex h-16 items-stretch">
        <Link
          href="/"
          className="border-border hover:bg-secondary flex shrink-0 items-center gap-2.5 border-r px-5 transition-colors"
        >
          <LogoMark size={28} />
          <span className="flex flex-col">
            <span className="font-display text-label leading-none">
              HimVirasat
            </span>
            <span
              aria-hidden
              className="font-takri text-muted-foreground mt-1 text-[10px] leading-none"
            >
              {site.takriName}
            </span>
          </span>
        </Link>

        <MegaMenu panels={panels} />

        <div className="ml-auto flex items-stretch">
          {/* Upstream added this as an icon button using
              `@icons-pack/react-simple-icons`. Kept as a feature, dropped
              as a dependency: a whole icon package for one glyph, in a
              system whose icons are all drawn on the same pixel lattice.
              A text link also sits better in an editorial nav. */}
          <Link
            href={site.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border text-nav text-muted-foreground hover:bg-secondary hover:text-foreground hidden items-center border-l px-4 transition-colors md:flex"
          >
            GitHub
          </Link>
          <div className="border-border flex items-center border-l px-2">
            <ThemeToggle />
          </div>
          <div className="hidden items-center gap-2 px-4 md:flex">
            <Button asChild variant="secondary">
              <Link href="/contribute">Contribute</Link>
            </Button>
            <Button asChild>
              <Link href="/vocabulary">Explore vocabulary</Link>
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="border-border hover:bg-secondary flex items-center border-l px-5 transition-colors md:hidden"
          >
            <PixelIcon name={isOpen ? "close" : "grid"} />
          </button>
        </div>
      </nav>

      {isOpen && (
        <div
          id="mobile-nav"
          className="bg-background border-border animate-fade-slide fixed inset-x-0 top-16 bottom-0 overflow-y-auto border-t md:hidden"
        >
          {panels.map((panel) => (
            <div key={panel.label} className="border-border border-b">
              <Eyebrow className="px-4 pt-5">{panel.label}</Eyebrow>
              <ul className="mt-2 flex flex-col">
                {panel.groups.flatMap((group) =>
                  group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <ArrowRow
                        href={link.href}
                        label={link.label}
                        description={link.description}
                        external={link.external}
                      />
                    </li>
                  )),
                )}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-3 p-4">
            <Button asChild size="lg">
              <Link href="/contribute">Start contributing</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/vocabulary">Explore the vocabulary</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
