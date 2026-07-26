import Link from "next/link";

import { PixelIcon } from "@/components/mistral/pixel-icon";

/** Card linking to a language tool, with an optional Takri glyph tile. */
export function ToolCard({
  href,
  title,
  description,
  glyph,
}: {
  href: string;
  title: string;
  description: string;
  glyph?: string;
}) {
  return (
    <Link
      href={href}
      className="ruled-cell hover:bg-secondary group flex h-full flex-col p-8 transition-colors focus-visible:outline-none focus-visible:bg-secondary"
    >
      {glyph && (
        <span
          aria-hidden
          className="bg-pine-100 font-takri mb-6 grid size-14 place-items-center text-3xl text-[#07070b]"
        >
          {glyph}
        </span>
      )}
      <h2 className="text-title">{title}</h2>
      <p className="text-body-sm text-muted-foreground mt-2 flex-1">
        {description}
      </p>
      <PixelIcon
        name="chevron-right"
        className="text-muted-foreground mt-6 size-4 transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}
