import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The design system adds named font sizes (`text-title`, `text-eyebrow`,
 * `text-body-sm`, …). tailwind-merge cannot tell those from colour
 * utilities, so without this it classifies `text-title` as a *colour* and
 * silently drops the `text-muted-foreground` sitting next to it. Every
 * custom size paired with a colour would lose the colour.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-lg",
            "display-md",
            "title",
            "label",
            "nav",
            "body-lg",
            "body",
            "body-sm",
            "eyebrow",
            "eyebrow-lg",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
