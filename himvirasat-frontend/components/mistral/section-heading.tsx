import { cn } from "@/lib/utils";

import { Eyebrow } from "./eyebrow";

/**
 * Section title. Centred by default — the display sizes are large enough
 * that a centred axis reads as deliberate rather than decorative.
 */
export function SectionHeading({
  eyebrow,
  nativeEcho,
  title,
  description,
  align = "center",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  nativeEcho?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn(centered && "text-center", className)}>
      {eyebrow && (
        <Eyebrow nativeEcho={nativeEcho} className="mb-5">
          {eyebrow}
        </Eyebrow>
      )}
      <Tag className="text-display-md md:text-display-xl text-balance">
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            "text-body-lg text-muted-foreground mt-6 max-w-prose",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
