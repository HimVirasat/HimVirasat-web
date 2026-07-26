"use client";

import { useRef } from "react";

import { ArrowRow } from "@/components/mistral/arrow-row";
import { Eyebrow } from "@/components/mistral/eyebrow";
import { ScrollCue } from "@/components/mistral/scroll-cue";
import { TakriMosaic } from "@/components/mistral/takri-mosaic";
import { makeRng, seedFromString } from "@/lib/seeded-rng";
import { devToTankri } from "@/lib/transliteration/devToTankri";

/**
 * The landing composition: a headline and the mission statement across the
 * top, the Takri mosaic and a featured item beneath.
 *
 * The `data-hero` attributes and the refs are hooks for the scroll-driven
 * timeline that arrives in a follow-up. They are deliberately left in place
 * so that change is additive rather than a rewrite of this markup.
 *
 * The headline itself animates on load in pure CSS — see `char-rise` in
 * globals.css — with its per-character delays seeded so the server and the
 * client agree.
 */

const HEADLINE = "Himachal speaks in many tongues. We are writing them down.";

const HEADLINE_LINES = [
  "Himachal speaks in many",
  "tongues. We are writing",
  "them down.",
];

const MISSION = [
  "An initiative driven by the community to preserve",
  "Himachal Pradesh's languages, dialects, traditions",
  "and cultural memory, and bring them into the digital age.",
];

const FEATURED = {
  label: "Mandeali vocabulary is live",
  description: "The first dialect archive is open to search.",
  href: "/vocabulary/mandeali",
};

/** Characters rise from behind a per-line mask on load; delays are seeded. */
function buildLines(text: string, lines: string[]) {
  const rng = makeRng(seedFromString(text));
  return lines.map((line, li) => ({
    line,
    lineDelay: li * 90,
    chars: Array.from(line).map((ch, ci) => ({
      ch,
      delay: li * 90 + Math.round(ci * (1 + rng() * 4) * 5),
    })),
  }));
}

export function Hero() {
  const lines = buildLines(HEADLINE, HEADLINE_LINES);

  const root = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLParagraphElement>(null);
  const leftTop = useRef<HTMLDivElement>(null);
  const leftTopInner = useRef<HTMLDivElement>(null);
  const leftMiddle = useRef<HTMLDivElement>(null);
  const leftMiddleInner = useRef<HTMLDivElement>(null);
  const rightTop = useRef<HTMLDivElement>(null);
  const rightInner = useRef<HTMLDivElement>(null);
  const rightContent = useRef<HTMLDivElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={root}
      data-hero="root"
      className="border-border relative border-b"
    >
      <div ref={sticky} className="lg:h-dvh lg:overflow-hidden">
        {/* Row 1 — headline and mission */}
        <div className="border-border flex flex-col border-b lg:relative lg:h-[60dvh] lg:flex-row">
          <div
            ref={leftTop}
            data-hero="left-top"
            className="flex shrink-0 flex-col justify-end overflow-hidden px-6 pt-16 pb-10 lg:w-[70%] lg:px-10 lg:pt-0"
          >
            {/* Everything that collapses lives inside a wrapper whose width
                is pinned in pixels while the timeline runs. The column
                animates to `width: 0` and clips; the wrapper never changes
                size, so the headline cannot re-wrap. Without this the
                paragraph reflowed to one character per line and grew from
                176px to 3293px tall, re-laid-out on every scroll frame. */}
            <div ref={leftTopInner} className="flex flex-col justify-end">
              <Eyebrow
                size="lg"
                nativeEcho={devToTankri("हिमाचल की विरासत")}
                className="mb-8"
              >
                Open language preservation
              </Eyebrow>

              {/* The real heading, for assistive tech and for search. The
                  animated copy is decorative: split to characters it would
                  be announced letter by letter. */}
              <h1 className="sr-only">{HEADLINE}</h1>
              <p
                ref={title}
                data-hero="title"
                aria-hidden
                className="font-display text-display-md md:text-display-xl max-w-4xl"
              >
                {lines.map(({ line, lineDelay, chars }, li) => (
                  <span
                    key={line}
                    className="hero-line hero-line-grow"
                    style={
                      { "--line-delay": `${lineDelay}ms` } as React.CSSProperties
                    }
                  >
                    {chars.map(({ ch, delay }, ci) => (
                      <span
                        key={`${li}-${ci}`}
                        className="hero-char"
                        style={
                          { "--char-delay": `${delay}ms` } as React.CSSProperties
                        }
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Taken out of the flex flow on desktop. As a flex sibling its
              right edge tracked the collapsing left column, so the panel's
              `right-0` anchor slid leftward with it and the expanded panel
              ended up at x = -1130 instead of covering the viewport. */}
          <div
            ref={rightTop}
            className="relative lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-[30%]"
          >
            {/* Anchored right, so growing its width expands leftward across
                the space the collapsing left column vacates. */}
            <div
              ref={rightInner}
              data-hero="right-inner"
              className="border-border flex h-full flex-col justify-end overflow-hidden border-t px-6 py-10 lg:absolute lg:top-0 lg:right-0 lg:w-full lg:border-t-0 lg:border-b lg:border-l lg:px-10"
            >
              <div ref={rightContent} className="hero-mission">
                {MISSION.map((line) => (
                  <p
                    key={line}
                    className="js-hero-sentence hero-mission-line text-body-lg text-muted-foreground will-change-transform"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
            {/* Tint that burns off as the panel takes over the viewport. */}
            <div
              ref={background}
              data-hero="background"
              aria-hidden
              className="bg-secondary pointer-events-none absolute inset-0 -z-10"
            />
          </div>
        </div>

        {/* Row 2 — mosaic, cue and one featured item */}
        <div className="flex flex-col lg:h-[40dvh] lg:flex-row">
          <div
            ref={leftMiddle}
            data-hero="left-middle"
            className="hero-fade-in relative shrink-0 overflow-hidden lg:w-[70%]"
          >
            {/* Pinned for the same reason as the headline: collapsing this
                column would otherwise re-lay the mosaic's 30-cell grid on
                every frame. `relative` so the corner labels still position
                against the mosaic rather than the column. */}
            <div ref={leftMiddleInner} className="relative">
              <TakriMosaic variant="hero" seed={7} />

              {/* On the reference these labels are painted inside the Lottie
                  artwork. Ours are real text on a solid chip, the only way to
                  stay legible over a mosaic containing both near-white and
                  deep pine. */}
              <Eyebrow className="js-hero-label bg-background pointer-events-none absolute bottom-3 left-3 px-2 py-0.5">
                Open language preservation
              </Eyebrow>
              <Eyebrow className="js-hero-label bg-background pointer-events-none absolute right-3 bottom-3 px-2 py-0.5">
                Himachal
              </Eyebrow>
            </div>
          </div>

          <div className="border-border flex flex-col justify-between overflow-hidden border-t lg:w-[30%] lg:border-t-0 lg:border-l">
            <div ref={arrow}>
              <ScrollCue className="items-start p-10" />
            </div>
            <div ref={cards} className="border-border border-t">
              <Eyebrow className="px-4 pt-5">Featured</Eyebrow>
              <ArrowRow
                href={FEATURED.href}
                label={FEATURED.label}
                description={FEATURED.description}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
