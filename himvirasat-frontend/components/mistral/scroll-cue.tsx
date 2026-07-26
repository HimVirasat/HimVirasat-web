import { cn } from "@/lib/utils";

import { PixelIcon } from "./pixel-icon";

/**
 * Three stacked chevrons pulsing in sequence, hinting there is more below
 * the fold. Each sits on the same 2s loop offset by 200ms, so the pulse
 * reads as travelling downward rather than three things blinking.
 *
 * Decorative: the page is navigable without it, so it is hidden from
 * assistive tech rather than announced as a control.
 */
export function ScrollCue({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "text-muted-foreground flex flex-col items-center gap-1",
        className,
      )}
    >
      {[0, 200, 400].map((delay) => (
        <PixelIcon
          key={delay}
          name="chevron-down"
          className="animate-arrow-cue size-4"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
