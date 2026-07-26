import { cn } from "@/lib/utils";

import { Eyebrow } from "./eyebrow";

/**
 * Deep-dive layout: a narrow index rail that sticks under the header
 * while the wide content column scrolls past it. Ten columns, two for the
 * rail, matching the page's underlying grid.
 *
 * The rail is hidden below `md` — on narrow screens it would cost more
 * height than the orientation it buys.
 */
export function StickyRailSection({
  eyebrow,
  nativeEcho,
  railTitle,
  railFooter,
  className,
  children,
}: {
  eyebrow: string;
  nativeEcho?: string;
  railTitle: React.ReactNode;
  railFooter?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("border-border border-t md:grid md:grid-cols-10", className)}>
      <div className="border-border hidden md:sticky md:top-16 md:col-span-2 md:flex md:h-[calc(100dvh-4rem)] md:flex-col md:justify-between md:border-r md:px-6 md:py-12">
        <div>
          <Eyebrow nativeEcho={nativeEcho}>{eyebrow}</Eyebrow>
          <p className="text-title mt-4 text-balance">{railTitle}</p>
        </div>
        {railFooter && (
          <div className="text-body-sm text-muted-foreground">{railFooter}</div>
        )}
      </div>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}
