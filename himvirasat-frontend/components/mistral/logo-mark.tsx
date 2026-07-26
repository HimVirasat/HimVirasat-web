import { cn } from "@/lib/utils";

/**
 * Brand mark: a snow-capped ridgeline built from mosaic tiles — glacial
 * summit, sage upper slopes, forest and pine below, timber at the base.
 * Same square unit as `PixelIcon` and `TakriMosaic`, so the mark, the
 * icons and the mosaic all read as one alphabet.
 *
 * This tile table is duplicated verbatim in app/icon.tsx and
 * app/opengraph-image.tsx — satori renders those and cannot import a
 * React component, so all three must be changed together.
 *
 * Decorative — adjacent text always names the brand.
 */

/** [column, row, palette step] on a 4×4 lattice, origin top-left. */
const TILES: Array<[number, number, number]> = [
  [2, 0, 0],
  [1, 1, 1],
  [2, 1, 1],
  [0, 2, 2],
  [1, 2, 2],
  [2, 2, 2],
  [3, 2, 3],
  [0, 3, 4],
  [1, 3, 4],
  [2, 3, 3],
  [3, 3, 4],
];

/** summit → base: glacier, sage, forest, pine, timber. */
const PEAK = ["#7ec6c6", "#7fb69b", "#2e7358", "#1c5341", "#6e4e36"];

export function LogoMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0 select-none", className)}
    >
      {TILES.map(([col, row, step]) => (
        <rect
          key={`${col}-${row}`}
          x={col * 8}
          y={row * 8}
          width={8}
          height={8}
          fill={PEAK[step]}
        />
      ))}
    </svg>
  );
}
