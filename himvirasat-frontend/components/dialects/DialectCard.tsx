import Link from "next/link";

import { Eyebrow } from "@/components/mistral/eyebrow";
import { PixelIcon } from "@/components/mistral/pixel-icon";
import { Button } from "@/components/ui/button";

type DialectCardProps = {
  name: string;
  formUrl: string;
};

/** Dialect → district, only where the mapping is unambiguous. */
const DISTRICT_MAP: Array<[pattern: string, district: string]> = [
  ["kangri", "Kangra"],
  ["mandeali", "Mandi"],
  ["mandyali", "Mandi"],
  ["kullvi", "Kullu"],
  ["kulluvi", "Kullu"],
  ["kinnauri", "Kinnaur"],
  ["sirmauri", "Sirmaur"],
  ["chambeali", "Chamba"],
  ["chameali", "Chamba"],
  ["mahasuvi", "Shimla hills"],
];

export default function DialectCard({ name, formUrl }: DialectCardProps) {
  const lowerName = name.toLowerCase();
  const district = DISTRICT_MAP.find(([pattern]) =>
    lowerName.includes(pattern),
  )?.[1];
  const hasVocabulary = lowerName.includes("mandeali");

  return (
    <article className="ruled-cell flex h-full flex-col p-8">
      <h3 className="text-title">{name}</h3>
      {district && <Eyebrow className="mt-2">{district}</Eyebrow>}

      <p className="text-body-sm text-muted-foreground mt-4">
        Contribute everyday sentences and Hindi translations in the {name}{" "}
        dialect.
      </p>

      {hasVocabulary && (
        <p className="mt-4">
          <Link
            href="/vocabulary/mandeali"
            className="text-verdant text-body-sm link-quiet inline-flex items-center gap-1"
          >
            Vocabulary live
            <PixelIcon name="chevron-right" className="size-3.5" />
          </Link>
        </p>
      )}

      <div className="mt-auto pt-8">
        <Button asChild variant="secondary" className="w-full">
          <Link href={formUrl} target="_blank" rel="noopener noreferrer">
            Open the {name} form
            <PixelIcon name="arrow-up-right" className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
