"use client";

import { useEffect, type RefObject } from "react";

import { PixelIcon, type PixelIconName } from "@/components/mistral/pixel-icon";
import { useReveal } from "@/hooks/use-reveal";
import { makeRng } from "@/lib/seeded-rng";
import { cn } from "@/lib/utils";

/**
 * Marks the node `data-in-view` so the drift loop can be paused while it is
 * off-screen — see the rule in globals.css for why that matters.
 *
 * Writes the attribute directly instead of going through state: this fires
 * on every scroll past every mosaic, and a re-render per crossing is the
 * opposite of the point. `useReveal` is deliberately left alone; its latch
 * is correct for content reveals, which must not un-reveal.
 */
function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) =>
        node.setAttribute("data-in-view", String(entry.isIntersecting)),
      // A margin either side, so a mosaic is already running by the time it
      // is scrolled into view rather than starting mid-phase.
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
}

/**
 * The signature graphic: a grid of flat square tiles in the Deodar palette,
 * carrying single Takri letters and Himachali motifs, with occasional
 * rotated diamonds. Everything is drawn on the same square unit as
 * `PixelIcon`, so the mark, the icons and the mosaic share one alphabet.
 *
 * Every tile is a four-sided prism that turns a quarter at a time, and
 * each face is dealt independently: its own colour, and its own content.
 * A tile can carry a letter on one face, nothing on the next and a motif
 * on the one after — which is where the appearing and disappearing icons
 * come from. Only the turn is CSS; the deal is all here.
 *
 * Three invariants hold by construction rather than by checking after:
 *
 *   1. No colour appears more than twice in any one frame. Tones are
 *      dealt from a bag containing exactly two copies of each, so a third
 *      use is not representable.
 *   2. No letter and no motif appears twice in any one frame. Both are
 *      drawn without replacement, per frame. Across the whole turn they
 *      may recur — with 12 letters showing at once there are not four
 *      disjoint sets in a 42-letter block, and there are only eight
 *      motifs.
 *   3. Ink always pairs with the fill it sits on, because both come from
 *      the same tone on the same face. This used to need a per-tile
 *      polarity lock, since a fixed mark had to stay legible across four
 *      changing colours; content that turns with the colour doesn't.
 *
 * The pattern is generated from a fixed seed through a pure PRNG, so the
 * server and the client produce byte-identical markup. Never introduce
 * `Math.random()` here — it would desynchronise hydration.
 */

type Tone = { fill: string; ink: string };

const INK_DARK = "#07070b";
const INK_CREAM = "#fbfbf8";

/**
 * Every fill below was checked against both inks. AA at 4.5:1 needs
 * relative luminance >= 0.185 for near-black ink or <= 0.175 for cream;
 * a tone between those is unusable with either. None are. Worst pairing
 * is clay-500 at 4.90:1. Adding a tone means redoing that arithmetic.
 */
const DARK_INK: Tone[] = [
  { fill: "#a9cfbc", ink: INK_DARK }, // pine 50
  { fill: "#7fb69b", ink: INK_DARK }, // pine 100 — sage
  { fill: "#64a687", ink: INK_DARK }, // pine 200
  { fill: "#4e9578", ink: INK_DARK }, // pine 300 — meadow
  { fill: "#b9dedc", ink: INK_DARK }, // glacier 100 — pale ice
  { fill: "#7ec6c6", ink: INK_DARK }, // glacier 300
  { fill: "#5cb0b4", ink: INK_DARK }, // glacier 400
  { fill: "#3e9ca3", ink: INK_DARK }, // glacier 500
  { fill: "#d3b79b", ink: INK_DARK }, // clay 200 — sand
  { fill: "#a98363", ink: INK_DARK }, // clay 400
  { fill: "#b7bdb6", ink: INK_DARK }, // stone 300 — slate
];

const CREAM_INK: Tone[] = [
  { fill: "#2e7358", ink: INK_CREAM }, // pine 500 — forest
  { fill: "#1c5341", ink: INK_CREAM }, // pine 700
  { fill: "#0f3a2e", ink: INK_CREAM }, // pine 900 — deep pine
  { fill: "#2a7480", ink: INK_CREAM }, // glacier 700
  { fill: "#8b6749", ink: INK_CREAM }, // clay 500
  { fill: "#6e4e36", ink: INK_CREAM }, // clay 600 — timber
  { fill: "#4a3324", ink: INK_CREAM }, // clay 800
  { fill: "#5d6660", ink: INK_CREAM }, // stone 600
];

/**
 * Snow. Read from tokens rather than literals so they invert with the
 * theme — near-white on the dark canvas, warm paper on the light one.
 * Seven steps because the band variant carries thirteen neutral tiles and
 * the cap of two per colour means three tones could only cover six.
 */
const SNOW: Tone[] = Array.from({ length: 7 }, (_, i) => ({
  fill: `var(--mosaic-${i + 1})`,
  ink: INK_DARK,
}));

const TINTED = [...DARK_INK, ...CREAM_INK];
const ALL_TONES = [...TINTED, ...SNOW];

/** Takri, U+11680–U+116A9. Forty-two letters, drawn without replacement. */
const GLYPHS = Array.from({ length: 0x116a9 - 0x11680 + 1 }, (_, i) =>
  String.fromCodePoint(0x11680 + i),
);

/** Himachali motifs, in the same pixel grammar as the icons. */
const MOTIFS: PixelIconName[] = [
  "deodar",
  "pagoda",
  "kathkuni",
  "peak",
  "charkha",
  "shawl",
  "terrace",
  "chulha",
];

/**
 * Marks are accents on a mostly quiet grid, not the substance of it —
 * roughly a third of the tiles carry anything. An earlier pass marked
 * three fifths of them and the mosaic read as clutter.
 *
 * `tinted` is not a free knob. Whatever is not tinted is snow, and snow
 * has 7 tones against a cap of two uses each — 14 slots. Dropping
 * `tinted` to 0.45 here put 16 neutral tiles against those 14 slots, the
 * bag ran dry, and the cap silently broke at four uses of one colour.
 * Every variant must leave `tiles * (1 - tinted) <= 14`.
 */
const VARIANTS = {
  hero: {
    tiles: 30,
    cols: "grid-cols-6 sm:grid-cols-10",
    waveCols: 10,
    tinted: 0.55, // 17 tinted / 13 snow
    glyphs: 6,
    motifs: 2,
    diamonds: 1,
  },
  band: {
    tiles: 24,
    cols: "grid-cols-6 sm:grid-cols-12",
    waveCols: 12,
    tinted: 0.45, // 11 tinted / 13 snow
    glyphs: 4,
    motifs: 2,
    diamonds: 1,
  },
  panel: {
    tiles: 16,
    cols: "grid-cols-4",
    waveCols: 4,
    tinted: 0.5, // 8 tinted / 8 snow
    glyphs: 3,
    motifs: 1,
    diamonds: 1,
  },
} as const;

const PHASES = 4;

/** Fisher–Yates against the seeded PRNG. */
function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Kind = "glyph" | "motif" | "diamond" | "plain";

export function TakriMosaic({
  variant = "hero",
  seed = 7,
  className,
}: {
  variant?: keyof typeof VARIANTS;
  /** Change to reshuffle the pattern; must be stable across renders. */
  seed?: number;
  className?: string;
}) {
  const v = VARIANTS[variant];
  const { ref, revealed } = useReveal<HTMLDivElement>();
  usePauseOffscreen(ref);
  const rng = makeRng(seed);

  // Every face of every tile is dealt independently. One pass per phase,
  // each pass a self-contained frame that has to satisfy the invariants on
  // its own — which is exactly what "nothing repeats on screen" means when
  // what is on screen changes four times a loop.
  type Face = { fill: string; ink: string; kind: Kind; glyph: string | null; motif: PixelIconName | null };
  const faces: Face[][] = [];

  for (let p = 0; p < PHASES; p++) {
    // Which tiles are tinted this frame, and what each of them carries.
    const order = shuffle(
      Array.from({ length: v.tiles }, (_, i) => i),
      rng,
    );
    const tintedOrder = order.slice(0, Math.round(v.tiles * v.tinted));
    const tintedSet = new Set(tintedOrder);

    const kinds = new Map<number, Kind>();
    let cursor = 0;
    for (let n = 0; n < v.glyphs && cursor < tintedOrder.length; n++)
      kinds.set(tintedOrder[cursor++], "glyph");
    for (let n = 0; n < v.motifs && cursor < tintedOrder.length; n++)
      kinds.set(tintedOrder[cursor++], "motif");
    for (let n = 0; n < v.diamonds && cursor < tintedOrder.length; n++)
      kinds.set(tintedOrder[cursor++], "diamond");

    // Drawn without replacement, so neither a letter nor a motif can show
    // up twice in the same frame. Counts are set per variant to stay well
    // inside both pools: 42 letters against at most 12, 8 motifs against
    // at most 4.
    const letters = shuffle(GLYPHS, rng).slice(0, v.glyphs);
    const motifs = shuffle(MOTIFS, rng).slice(0, v.motifs);

    // A bag holding exactly two copies of every tone. A tile takes the
    // first tone the bag offers that its pool allows, so a third use of
    // any colour is not representable. Marked tiles draw from the full
    // tinted range now — the old polarity lock existed only because a
    // fixed mark had to survive four colour changes.
    const bag = shuffle(
      ALL_TONES.flatMap((t) => [t, t]),
      rng,
    );
    const row: Face[] = [];
    const used = new Map<string, number>();
    for (let i = 0; i < v.tiles; i++) {
      const allowed = tintedSet.has(i) ? TINTED : SNOW;
      const at = bag.findIndex((t) => allowed.includes(t));
      // The variants are sized so the bag never runs dry. If a future one
      // is not, take the least-used tone rather than the first: the cap
      // then degrades by one instead of landing every overflow on the
      // same colour, which is how it broke at four uses of one snow tone.
      const tone =
        at >= 0
          ? bag.splice(at, 1)[0]
          : allowed.reduce((best, t) =>
              (used.get(t.fill) ?? 0) < (used.get(best.fill) ?? 0) ? t : best,
            );
      used.set(tone.fill, (used.get(tone.fill) ?? 0) + 1);
      const kind: Kind = kinds.get(i) ?? "plain";
      row.push({
        fill: tone.fill,
        ink: tone.ink,
        kind,
        glyph: kind === "glyph" ? (letters.pop() ?? null) : null,
        motif: kind === "motif" ? (motifs.pop() ?? null) : null,
      });
    }
    faces.push(row);
  }

  // Turn slots: a shuffled queue of evenly spaced positions across one
  // quarter-loop. Even spacing is what holds the count of simultaneous
  // turns steady — drawing each offset at random instead would clump, and
  // the mosaic would alternate between motionless and half of it moving.
  // Shuffling keeps the order off the grid, so it reads as scattered
  // rather than as a sweep.
  const slotOrder = shuffle(
    Array.from({ length: v.tiles }, (_, i) => i),
    rng,
  );

  const cells = Array.from({ length: v.tiles }, (_, i) => ({
    faces: faces.map((row) => row[i]),
    // Diagonal wave, so variants that animate an entrance land as one
    // gesture rather than trickling across in DOM order.
    wave: Math.floor(i / v.waveCols) + (i % v.waveCols),
    turnSlot: slotOrder[i] / v.tiles,
    // Left, right, up or down.
    axis: rng() < 0.5 ? "x" : "y",
    dir: rng() < 0.5 ? "reverse" : "normal",
  }));

  return (
    <div
      ref={ref}
      aria-hidden
      data-mosaic={variant}
      data-revealed={revealed}
      className={cn("grid w-full", v.cols, className)}
    >
      {cells.map((c, i) => (
        <div
          key={i}
          data-kind={c.faces[0].kind}
          className="mosaic-tile relative aspect-square"
          style={
            {
              // A face is exactly edge-on for an instant on each quarter
              // turn, and a tile with no background of its own shows the
              // page through that slit — a black crack across a light
              // mosaic. Backing the tile means the turn reveals a tile
              // edge in the palette instead of a hole.
              backgroundColor: c.faces[0].fill,
              "--i": c.wave,
              "--turn-slot": c.turnSlot,
            } as React.CSSProperties
          }
        >
          <div className="mosaic-cube" data-axis={c.axis} data-dir={c.dir}>
            {c.faces.map((f, p) => (
              <div
                key={p}
                data-face={p}
                data-kind={f.kind}
                className="mosaic-face"
                style={{
                  backgroundColor: f.fill,
                  // Quarter turns around whichever axis this tile turns
                  // on, each face pushed out to the prism's surface.
                  //
                  // The depth is not optional, even with no perspective.
                  // A face at depth d rotated by θ projects to x = d·sinθ,
                  // so at d = 0 all four faces share one hinge down the
                  // middle of the tile and open outward from it instead of
                  // riding round. Half the tile's width puts them on the
                  // surface; `cqw` resolves against the tile itself.
                  transform:
                    c.axis === "x"
                      ? `rotateX(${p * 90}deg) translateZ(50cqw)`
                      : `rotateY(${p * 90}deg) translateZ(50cqw)`,
                }}
              >
                {f.glyph && (
                  <span
                    className="font-takri text-[clamp(1rem,3.2vw,2.75rem)] leading-none select-none"
                    style={{ color: f.ink }}
                  >
                    {f.glyph}
                  </span>
                )}
                {f.motif && (
                  <PixelIcon
                    name={f.motif}
                    className="size-[58%]"
                    style={{ color: f.ink }}
                  />
                )}
                {f.kind === "diamond" && (
                  <span
                    className="mosaic-diamond block size-[52%] rotate-45"
                    style={{ backgroundColor: f.ink }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
