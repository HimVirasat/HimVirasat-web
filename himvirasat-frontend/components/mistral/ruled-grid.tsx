import { cn } from "@/lib/utils";

/**
 * Grid whose cells butt together and are separated by hairlines.
 *
 * The rules are drawn by a 1px gap over the container's border colour
 * rather than by per-cell borders, so the internal lines stay exactly 1px
 * at every column count and never double up. Cells therefore need an
 * opaque background of their own — use `RuledCell`, or apply the
 * `ruled-cell` class.
 *
 * Because the container colour shows through anywhere a cell is missing,
 * the child count must divide evenly by every column count in `cols`. A
 * six-item grid works at 1/2/3 columns; a four-item grid works at 1/2/4
 * but would leave a solid band at 3.
 */

const COLUMNS = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  "2-3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "2-4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function RuledGrid({
  cols = 3,
  bordered = true,
  as: Tag = "div",
  className,
  children,
}: {
  cols?: keyof typeof COLUMNS;
  /** Set false when the section already supplies its own outer rule. */
  bordered?: boolean;
  /** Use `ul`/`ol` when the cells are a genuine list. */
  as?: "div" | "ul" | "ol";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "bg-border grid gap-px",
        bordered && "border-border border",
        COLUMNS[cols],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function RuledCell({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("ruled-cell p-8", className)} {...props}>
      {children}
    </div>
  );
}
