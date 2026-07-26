import { cn } from "@/lib/utils";

/**
 * Full-bleed dark section. Stays dark in both themes — it is a structural
 * break in the page, not a theme response. `surface-ink` re-themes the
 * shadcn variables for everything nested inside, so buttons and hairlines
 * within pick up the correct dark values automatically.
 */
export function InkBand({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("surface-ink border-ink-border border-y", className)}
      {...props}
    >
      {children}
    </section>
  );
}
