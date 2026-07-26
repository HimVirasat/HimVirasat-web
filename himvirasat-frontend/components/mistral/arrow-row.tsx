import Link from "next/link";

import { cn } from "@/lib/utils";

import { PixelIcon } from "./pixel-icon";

/**
 * Ruled list row. At rest the arrow sits off the left edge; on hover or
 * keyboard focus it slides in while the label shifts right to make room.
 * The motion is defined by the `row-arrow` utility in globals.css so the
 * timing stays identical everywhere it is used.
 */
export function ArrowRow({
  href,
  label,
  description,
  external,
  className,
}: {
  href: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  external?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      <span
        data-arrow
        aria-hidden
        className="absolute left-2 inline-flex w-5 shrink-0"
      >
        <PixelIcon name={external ? "arrow-up-right" : "chevron-right"} />
      </span>
      <span data-arrow-label className="flex min-w-0 flex-col gap-0.5">
        <span className="text-label truncate">{label}</span>
        {description && (
          <span className="text-body-sm text-muted-foreground truncate">
            {description}
          </span>
        )}
      </span>
      <PixelIcon
        name={external ? "arrow-up-right" : "chevron-right"}
        className="text-muted-foreground ml-auto size-4 shrink-0"
      />
    </>
  );

  const classes = cn(
    "row-arrow ruled-cell relative flex items-center gap-3 overflow-hidden px-4 py-4 transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none",
    className,
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
