import { cn } from "@/lib/utils";

/**
 * Uppercase monospace label that sits above a heading or names a column.
 * The optional native-script echo is decorative and hidden from assistive
 * tech — the Latin label is the accessible name.
 */
export function Eyebrow({
  children,
  nativeEcho,
  size = "sm",
  as: Tag = "p",
  className,
}: {
  children: React.ReactNode;
  nativeEcho?: string;
  size?: "sm" | "lg";
  as?: "p" | "span" | "h3";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "font-mono text-muted-foreground inline-flex items-center gap-2 uppercase",
        size === "lg" ? "text-eyebrow-lg" : "text-eyebrow",
        className,
      )}
    >
      <span>{children}</span>
      {nativeEcho && (
        <span aria-hidden className="font-takri text-[1.1em] normal-case">
          {nativeEcho}
        </span>
      )}
    </Tag>
  );
}
