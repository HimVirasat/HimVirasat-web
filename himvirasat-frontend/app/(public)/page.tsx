import Link from "next/link";

import { ArrowRow } from "@/components/mistral/arrow-row";
import { DialectMarquee } from "@/components/mistral/dialect-marquee";
import { Eyebrow } from "@/components/mistral/eyebrow";
import { Hero } from "@/components/mistral/hero";
import { InkBand } from "@/components/mistral/ink-band";
import { PixelIcon, type PixelIconName } from "@/components/mistral/pixel-icon";
import { RuledCell, RuledGrid } from "@/components/mistral/ruled-grid";
import { SectionHeading } from "@/components/mistral/section-heading";
import { StickyRailSection } from "@/components/mistral/sticky-rail-section";
import { TakriMosaic } from "@/components/mistral/takri-mosaic";
import { Button } from "@/components/ui/button";
import { dialectsConfig } from "@/lib/dialects/dialect-config";
import { site } from "@/lib/site";
import { devToTankri } from "@/lib/transliteration/devToTankri";

const shell = "mx-auto w-full max-w-content px-6 lg:px-10";

/*
 * TODO(copy): these are the honest, checkable claims we can make today —
 * each points at a feature that actually exists. Replace with dated news
 * entries once the project has any.
 */
/* The Mandeali item is promoted into the hero's right column, so it is
   deliberately absent here rather than shown twice. */
const FEATURED = [
  {
    label: "Devanagari and Takri, both directions",
    description: "Convert between the two scripts in the browser.",
    href: "/tools/transliterator",
  },
  {
    label: "Translation datasets are public",
    description: "Versioned, downloadable, free to use in research.",
    href: "/datasets",
  },
];

/* Real Hindi words, transliterated live by the site's own converter. */
const SCRIPT_SAMPLES = [
  { deva: "पहाड़", gloss: "mountain" },
  { deva: "घर", gloss: "house" },
  { deva: "पानी", gloss: "water" },
  { deva: "रास्ता", gloss: "path" },
  { deva: "विरासत", gloss: "heritage" },
  { deva: "हिमाचल", gloss: "Himachal" },
];

const ARCHIVE: Array<{
  icon: PixelIconName;
  title: string;
  description: string;
  href: string;
}> = [
  {
    icon: "book",
    title: "Vocabulary",
    description: "Living dictionaries, searchable by dialect and by word.",
    href: "/vocabulary",
  },
  {
    icon: "stack",
    title: "Datasets",
    description: "Open Hindi to dialect translation pairs, versioned.",
    href: "/datasets",
  },
  {
    icon: "swap",
    title: "Transliterator",
    description: "Devanagari to Takri and back, entirely in the browser.",
    href: "/tools/transliterator",
  },
  {
    icon: "map",
    title: "Dialects",
    description: "One archive per dialect, opened as contributors arrive.",
    href: "/vocabulary",
  },
  {
    icon: "quill",
    title: "Contribute",
    description: "Write sentences in your dialect. No technical skill needed.",
    href: "/contribute",
  },
  {
    icon: "people",
    title: "Community",
    description: "Built in the open by people from across Himachal.",
    href: "/about",
  },
];

/* TODO(copy): confirm the framing of these four with the maintainers. */
const REASONS = [
  {
    title: "Nobody else is collecting this",
    body: "Himachali dialects sit outside every major language dataset. If they are not written down here, they are not written down anywhere.",
  },
  {
    title: "No technical skill required",
    body: "Write an everyday sentence in your dialect and its Hindi translation. That is the whole contribution.",
  },
  {
    title: "Open from the first line",
    body: "Every word collected is published under an open licence, free for researchers and model builders alike.",
  },
  {
    title: "Two scripts, one record",
    body: "Entries carry both Devanagari and Takri, so the older script stays legible to the next generation.",
  },
];

const WAYS = [
  {
    title: "Contribute words",
    body: "Add vocabulary and parallel sentences in the dialect you grew up speaking.",
    href: "/contribute",
    cta: "Start contributing",
  },
  {
    title: "Verify submissions",
    body: "Native speakers review what others have written and confirm spelling, sense and usage.",
    href: "/contribute",
    cta: "Join the review",
  },
  {
    title: "Build with the data",
    body: "Download the datasets and use them in research, tooling, or multilingual models.",
    href: "/datasets",
    cta: "Browse datasets",
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── Featured ─────────────────────────────────────────────────── */}
      <section className={`${shell} py-20 md:py-28`}>
        <Eyebrow size="lg" className="mb-6">
          Featured
        </Eyebrow>
        <ul className="border-border flex flex-col border-t">
          {FEATURED.map((item) => (
            <li key={item.href} className="border-border border-b">
              <ArrowRow
                href={item.href}
                label={item.label}
                description={item.description}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* ── Dialect marquee ──────────────────────────────────────────── */}
      <DialectMarquee />

      {/* ── Dialect strip ────────────────────────────────────────────── */}
      <section className="border-border border-b">
        <div className={`${shell} py-10`}>
          <Eyebrow className="mb-6">Dialects in the archive</Eyebrow>
          {/* Two columns, not four: the hairlines are drawn by a 1px gap
              over the container colour, so any cell short of a full row
              would render as a solid grey block. Cell count here is
              dialectsConfig.length + 1. */}
          <div className="bg-border grid gap-px sm:grid-cols-2">
            {dialectsConfig.map((dialect) => (
              <Link
                key={dialect.id}
                href={`/vocabulary/${dialect.id}`}
                className="ruled-cell hover:bg-secondary flex flex-col gap-1 px-5 py-6 transition-colors"
              >
                <span className="text-title">{dialect.title}</span>
                {dialect.nativeName && (
                  <span lang="hi" className="font-deva text-muted-foreground">
                    {dialect.nativeName}
                  </span>
                )}
                <span className="text-body-sm text-muted-foreground">
                  {dialect.subtitle}
                </span>
              </Link>
            ))}
            {/* Only published dialects are listed above. Six more are open
                for collection but have no vocabulary behind them yet, so
                they are named on /contribute rather than here. */}
            <Link
              href="/contribute"
              className="ruled-cell hover:bg-secondary flex flex-col gap-1 px-5 py-6 transition-colors"
            >
              <span className="text-title text-muted-foreground">
                Six more collecting
              </span>
              <span className="text-body-sm text-muted-foreground">
                Kangri, Kullvi, Mahasuvi, Kinnauri and more are open for
                contributions.
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Script showcase ──────────────────────────────────────────── */}
      <section className={`${shell} py-20 md:py-28`}>
        <SectionHeading
          eyebrow="Two scripts"
          title="Devanagari today, Takri kept alive."
          description="Takri was the working script of the western Himalaya before Devanagari displaced it. Every entry in the archive carries both."
        />
        <RuledGrid cols="2-3" className="mt-14">
          {SCRIPT_SAMPLES.map((sample) => (
            <RuledCell key={sample.deva} className="p-8">
              <Eyebrow>{sample.gloss}</Eyebrow>
              <p
                lang="hi"
                className="font-deva mt-5 text-4xl leading-none"
              >
                {sample.deva}
              </p>
              <p
                aria-hidden
                className="font-takri text-verdant mt-4 text-4xl leading-none"
              >
                {devToTankri(sample.deva)}
              </p>
            </RuledCell>
          ))}
        </RuledGrid>
        <div className="mt-10 flex justify-center">
          <Button asChild variant="secondary">
            <Link href="/tools/transliterator">Open the transliterator</Link>
          </Button>
        </div>
      </section>

      {/* ── Six-up archive grid ──────────────────────────────────────── */}
      <section className={`${shell} py-20 md:py-28`}>
        <SectionHeading
          eyebrow="The archive"
          title="Everything in one place."
        />
        <RuledGrid cols="2-3" className="mt-14">
          {ARCHIVE.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="ruled-cell hover:bg-secondary group flex flex-col p-8 transition-colors"
            >
              <PixelIcon name={item.icon} className="text-verdant size-7" />
              <h3 className="text-title mt-5">{item.title}</h3>
              <p className="text-body-sm text-muted-foreground mt-2 flex-1">
                {item.description}
              </p>
              <PixelIcon
                name="chevron-right"
                className="text-muted-foreground mt-6 size-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          ))}
        </RuledGrid>
      </section>

      {/* ── Deep dives ───────────────────────────────────────────────── */}
      <StickyRailSection
        eyebrow="Vocabulary"
        railTitle="Living dictionaries, one dialect at a time."
        railFooter="Search by word, by sense, or by dialect."
      >
        <div className="border-border flex flex-col gap-6 border-b px-6 py-16 lg:px-12 lg:py-24">
          <h2 className="text-display-md max-w-2xl text-balance">
            A word survives if somebody writes it down.
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl">
            Each dialect gets its own searchable archive: the word, how it is
            said, what it means, and the Hindi it maps to. Entries come from
            native speakers and are reviewed by native speakers.
          </p>
          <div>
            <Button asChild variant="secondary">
              <Link href="/vocabulary">Search the vocabulary</Link>
            </Button>
          </div>
        </div>
      </StickyRailSection>

      <StickyRailSection
        eyebrow="Datasets"
        railTitle="Open translation data, versioned and free."
        railFooter="Published for research and model training."
      >
        <div className="border-border flex flex-col gap-6 border-b px-6 py-16 lg:px-12 lg:py-24">
          <h2 className="text-display-md max-w-2xl text-balance">
            Himachali dialects belong in the models too.
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl">
            Contributions are compiled into structured Hindi to dialect
            translation pairs and published openly, so that the languages of
            Himachal are represented wherever multilingual systems are built.
          </p>
          <div>
            <Button asChild variant="secondary">
              <Link href="/datasets">Browse the datasets</Link>
            </Button>
          </div>
        </div>
      </StickyRailSection>

      <StickyRailSection
        eyebrow="Tools"
        railTitle="Script tooling that runs in the browser."
        railFooter="No account, no upload, no server round trip."
      >
        <div className="border-border flex flex-col gap-6 border-b px-6 py-16 lg:px-12 lg:py-24">
          <h2 className="text-display-md max-w-2xl text-balance">
            Read Takri without learning Takri first.
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl">
            The transliterator maps Devanagari to Takri and back, character by
            character, so older manuscripts and inscriptions stay approachable
            to anyone who can read Hindi.
          </p>
          <div>
            <Button asChild variant="secondary">
              <Link href="/tools/transliterator">Open the transliterator</Link>
            </Button>
          </div>
        </div>
      </StickyRailSection>

      {/* ── Why contribute ───────────────────────────────────────────── */}
      <section className={`${shell} py-20 md:py-28`}>
        <SectionHeading eyebrow="Why contribute" title="Four honest reasons." />
        <RuledGrid cols="2-4" className="mt-14">
          {REASONS.map((reason) => (
            <RuledCell key={reason.title} className="p-8">
              <h3 className="text-title text-balance">{reason.title}</h3>
              <p className="text-body-sm text-muted-foreground mt-3">
                {reason.body}
              </p>
            </RuledCell>
          ))}
        </RuledGrid>
      </section>

      {/* ── Ways to help ─────────────────────────────────────────────── */}
      <InkBand>
        <div className={`${shell} py-20 md:py-28`}>
          <SectionHeading
            eyebrow="Ways to help"
            title="Three ways in, whatever you bring."
            className="mb-14"
          />
          <div className="bg-ink-border grid gap-px sm:grid-cols-3">
            {WAYS.map((way) => (
              <div key={way.title} className="bg-ink flex flex-col p-8 lg:p-10">
                <h3 className="text-title">{way.title}</h3>
                <p className="text-body-sm mt-3 flex-1 text-muted-foreground">
                  {way.body}
                </p>
                <div className="mt-8">
                  <Button asChild variant="secondary">
                    <Link href={way.href}>{way.cta}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </InkBand>

      {/* ── Closing ──────────────────────────────────────────────────── */}
      <section className={`${shell} py-24 md:py-32`}>
        <SectionHeading
          as="h2"
          title="Preserve your mother tongue."
          description={`${site.name} is an open effort. The archive grows only as fast as people write into it.`}
        />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/contribute">Start contributing</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={site.links.repo} target="_blank" rel="noreferrer">
              Read the source
            </a>
          </Button>
        </div>
      </section>

      <TakriMosaic variant="band" seed={19} />
    </>
  );
}
