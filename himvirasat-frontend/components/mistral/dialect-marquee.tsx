import { Fragment } from "react";

import { cn } from "@/lib/utils";
import { devToTankri } from "@/lib/transliteration/devToTankri";

/**
 * A continuously scrolling strip of dialect names, in Latin and Takri.
 *
 * The track holds the sequence twice and translates by exactly -50%, so
 * the second copy is in the first's starting position when the loop wraps
 * and there is no visible seam. Pauses on hover; stops entirely under
 * reduced motion, where a strip that never stops moving is exactly what a
 * reader asked not to have.
 */

/**
 * The dialects with active collection forms — the same six listed on
 * /contribute, not an aspirational list.
 */
const DIALECTS = [
  "Kangri",
  "Mandeali",
  "Kullvi",
  "Mahasuvi",
  "Kinnauri",
  "Chambeali",
];

export function DialectMarquee({ className }: { className?: string }) {
  const row = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0">
      {/* Repeated so the sequence always overflows the widest viewport;
          otherwise a short list leaves a gap before the wrap.

          Two, not three. The track is one transform-animated element, so
          its full width has to be rasterised: at three repeats it measured
          10119 CSS px, which is 20238 device px on a 2× display — past
          Chrome's 16384 px texture limit, where a layer falls off the
          compositor fast path and is re-rastered instead. Two repeats put
          one copy at ~3372 px, still wider than any real viewport, and the
          track at ~13488 device px. Do not raise this without measuring
          `track.getBoundingClientRect().width * devicePixelRatio`. */}
      {Array.from({ length: 2 }).map((_, rep) =>
        DIALECTS.map((name) => (
          <Fragment key={`${rep}-${name}`}>
            <span className="text-title px-6 whitespace-nowrap">{name}</span>
            <span
              aria-hidden
              className="font-takri text-title text-verdant px-6 whitespace-nowrap"
            >
              {devToTankri(name)}
            </span>
          </Fragment>
        )),
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "marquee border-border overflow-hidden border-y py-4",
        className,
      )}
    >
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
