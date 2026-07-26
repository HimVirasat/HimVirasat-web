import { cn } from "@/lib/utils";

/**
 * Icons drawn as 4×4 squares on a 6×6 lattice inside a 30×30 viewBox.
 *
 * Every icon in the system is built from the same square unit as the
 * mosaic tiles, so arrows, chevrons and decorative blocks all read as one
 * alphabet. Cells are grid indices; `cell()` maps an index to its
 * user-space coordinate (5, 9, 13, 17, 21, 25).
 */

const CELL = 4;
const cell = (i: number) => 5 + CELL * i;

/** [column, row] pairs on the 6×6 lattice, origin top-left. */
const ICONS = {
  "chevron-right": [
    [1, 0],
    [2, 1],
    [3, 2],
    [2, 3],
    [1, 4],
  ],
  "chevron-left": [
    [3, 0],
    [2, 1],
    [1, 2],
    [2, 3],
    [3, 4],
  ],
  "chevron-down": [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 2],
    [4, 1],
  ],
  "arrow-up-right": [
    [0, 5],
    [1, 4],
    [2, 3],
    [3, 2],
    [4, 1],
    [2, 1],
    [3, 1],
    [4, 2],
    [4, 3],
  ],
  plus: [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [0, 2],
    [1, 2],
    [3, 2],
    [4, 2],
  ],
  minus: [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
  ],
  close: [
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
    [4, 0],
    [3, 1],
    [1, 3],
    [0, 4],
  ],
  grid: [
    [0, 0],
    [2, 0],
    [4, 0],
    [0, 2],
    [2, 2],
    [4, 2],
    [0, 4],
    [2, 4],
    [4, 4],
  ],
  /* Section markers for the six-up grid — each a distinct block figure. */
  book: [
    [0, 1],
    [1, 1],
    [2, 1],
    [0, 2],
    [2, 2],
    [0, 3],
    [1, 3],
    [2, 3],
    [4, 1],
    [4, 2],
    [4, 3],
  ],
  stack: [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 2],
  ],
  swap: [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 0],
    [3, 1],
    [1, 3],
    [2, 3],
    [3, 3],
    [1, 4],
  ],
  map: [
    [0, 0],
    [1, 1],
    [2, 0],
    [3, 1],
    [4, 0],
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
  ],
  quill: [
    [4, 0],
    [3, 1],
    [2, 2],
    [1, 3],
    [0, 4],
    [1, 4],
    [0, 3],
  ],
  people: [
    [1, 0],
    [1, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [4, 0],
    [4, 1],
    [3, 2],
    [4, 2],
    [1, 4],
    [3, 4],
  ],

  /* Himachali motifs. Same 4×4-square unit as everything above, so they
     sit in the mosaic beside the Takri letters without changing register. */

  /**
   * Deodar — a solid conifer over a single-cell trunk. The trunk is what
   * separates it from the pagoda at tile size; an earlier version widened
   * the base and both motifs just read as crosses.
   */
  deodar: [
    [2, 0],
    [1, 1],
    [2, 1],
    [3, 1],
    [1, 2],
    [2, 2],
    [3, 2],
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [2, 4],
  ],

  /**
   * Pagoda — two roof tiers with a gap between them. The gap is the
   * distinguishing feature: the deodar is a filled triangle, this is not.
   */
  pagoda: [
    [2, 0],
    [1, 1],
    [2, 1],
    [3, 1],
    [2, 2],
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [1, 4],
    [2, 4],
    [3, 4],
  ],

  /**
   * Kath-kuni — timber courses banded with dry-stone infill. Horizontal
   * banding, not a chequer; the chequer version read as noise.
   */
  kathkuni: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [0, 1],
    [2, 1],
    [4, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [0, 3],
    [2, 3],
    [4, 3],
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 4],
  ],

  /** Peak — the ridgeline of the brand mark, at tile scale. */
  peak: [
    [2, 1],
    [1, 2],
    [2, 2],
    [3, 2],
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 4],
  ],

  /* Four more, chosen for silhouette separation rather than iconographic
     detail. At 58% of a tile there is no room for detail — what carries is
     the outline, so each of these breaks a different way from the four
     above (filled triangle, gapped triangle, horizontal bands, solid
     mountain). */

  /**
   * Charkha — an open ring with a hub. The only round, hollow-centred mark
   * in the set, which is the whole reason it reads apart at tile size.
   */
  charkha: [
    [1, 0],
    [2, 0],
    [3, 0],
    [0, 1],
    [4, 1],
    [0, 2],
    [2, 2],
    [4, 2],
    [0, 3],
    [4, 3],
    [1, 4],
    [2, 4],
    [3, 4],
  ],

  /**
   * Shawl — the lozenge of a Kullu border. An outline, not a fill: it is
   * the only hollow diamond in the set, which is what separates it from
   * the solid diamond tile the mosaic also uses.
   *
   * An earlier version alternated cells row by row to suggest a chevron
   * weave. On a five-wide lattice that is just a chequerboard — rendered
   * side by side with the others it read as noise, not as a border.
   */
  shawl: [
    [2, 0],
    [1, 1],
    [3, 1],
    [0, 2],
    [4, 2],
    [1, 3],
    [3, 3],
    [2, 4],
  ],

  /**
   * Terrace — stepped hill fields. The only asymmetric mark in the set;
   * everything else is mirror-symmetric, so the lean is unmistakable even
   * when the shape is too small to count the steps.
   */
  terrace: [
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 4],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [2, 2],
    [3, 2],
    [4, 2],
    [3, 1],
    [4, 1],
    [4, 0],
  ],

  /**
   * Chulha — a hearth: a solid block with the fire mouth cut out of its
   * base. Solid where the ring and the weave are open, broken where the
   * peak and the deodar are whole.
   */
  chulha: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [0, 2],
    [4, 2],
    [0, 3],
    [4, 3],
    [0, 4],
    [4, 4],
  ],
} as const;

export type PixelIconName = keyof typeof ICONS;

export function PixelIcon({
  name,
  className,
  style,
}: {
  name: PixelIconName;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-5 shrink-0", className)}
      style={style}
    >
      {ICONS[name].map(([col, row]) => (
        <rect
          key={`${col}-${row}`}
          x={cell(col)}
          y={cell(row)}
          width={CELL}
          height={CELL}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
