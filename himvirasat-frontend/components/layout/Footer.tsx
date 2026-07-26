import Link from "next/link";

import { Eyebrow } from "@/components/mistral/eyebrow";
import { LogoMark } from "@/components/mistral/logo-mark";
import { RuledCell, RuledGrid } from "@/components/mistral/ruled-grid";
import { site } from "@/lib/site";

const columns = [
  {
    heading: "Explore",
    links: [
      { label: "Vocabulary", href: "/vocabulary" },
      { label: "Datasets", href: "/datasets" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { label: "Transliterator", href: "/tools/transliterator" },
      { label: "All tools", href: "/tools" },
      { label: "Contribute", href: "/contribute" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "HimVirasat Discord", href: site.links.discordHimvirasat },
      { label: "HP Community Discord", href: site.links.discordHpCommunity },
      { label: "GitHub", href: site.links.github },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "About", href: "/about" },
      { label: "Team", href: "/about#team" },
      { label: "Source code", href: site.links.repo },
    ],
  },
];

const linkClasses = "link-quiet text-body-sm text-muted-foreground";

export default function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="border-border flex flex-wrap items-start justify-between gap-8 border-b px-6 py-12 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={32} />
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
        <p className="text-body-sm text-muted-foreground max-w-md">
          {site.description}
        </p>
      </div>

      <RuledGrid cols={4} bordered={false} className="border-border border-b">
        {columns.map((column) => (
          <RuledCell key={column.heading} className="px-6 py-10 lg:px-10">
            <Eyebrow as="h3">{column.heading}</Eyebrow>
            <ul className="mt-5 flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={linkClasses}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className={linkClasses}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </RuledCell>
        ))}
      </RuledGrid>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-6 lg:px-10">
        <p className="text-body-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} HimVirasat
        </p>
        {/* Larger than the copyright beside it on purpose: Devanagari reads
            smaller than Latin at the same nominal size, so matching specs
            would leave the sign-off looking undersized. */}
        <p lang="hi" className="font-deva text-title text-muted-foreground">
          जय देवभूमि
        </p>
      </div>
    </footer>
  );
}
