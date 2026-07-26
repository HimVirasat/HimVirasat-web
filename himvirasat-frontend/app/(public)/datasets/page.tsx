import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow } from "@/components/mistral/eyebrow";
import { PixelIcon } from "@/components/mistral/pixel-icon";
import { RuledGrid } from "@/components/mistral/ruled-grid";
import { SectionHeading } from "@/components/mistral/section-heading";
import { TakriMosaic } from "@/components/mistral/takri-mosaic";
import { Button } from "@/components/ui/button";
import { datasets } from "@/lib/datasets/dataset-utils";
import { devToTankri } from "@/lib/transliteration/devToTankri";

export const metadata: Metadata = {
  title: "Datasets",
  description: "Download open, versioned Himachali translation datasets.",
};

export default function DatasetsPage() {
  return (
    <div>
      <section className="mx-auto w-full max-w-content px-6 pt-20 pb-14 md:pt-28 lg:px-10">
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="Datasets"
          nativeEcho={devToTankri("आंकड़े")}
          title="Open Himachali language datasets"
          description="Curated linguistic datasets preserving Himachali dialects, published for research, NLP, and cultural documentation."
        />
      </section>

      <TakriMosaic variant="band" seed={31} />

      <section className="mx-auto w-full max-w-content px-6 pt-14 pb-24 md:pb-32 lg:px-10">
        <RuledGrid cols={2}>
          {datasets.map((dataset) => (
            <article key={dataset.id} className="ruled-cell flex flex-col p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-title">{dataset.name}</h2>
                <Eyebrow className="text-verdant">
                  {dataset.version}
                </Eyebrow>
              </div>
              <p className="text-body-sm text-muted-foreground mt-1">
                {dataset.language}
              </p>
              <p className="text-body-sm text-muted-foreground mt-4 flex-1">
                Open, structured vocabulary data suitable for linguistic
                research, NLP training, and documentation.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <Button asChild>
                  <a href={dataset.datasetLink} target="_blank" rel="noreferrer">
                    Download ZIP
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <a href={dataset.kaggleLink} target="_blank" rel="noreferrer">
                    Kaggle
                  </a>
                </Button>
                <Button asChild variant="ghost">
                  <a href={dataset.githubLink} target="_blank" rel="noreferrer">
                    GitHub
                    <PixelIcon name="arrow-up-right" className="size-4" />
                  </a>
                </Button>
              </div>
            </article>
          ))}

          <Link
            href="/contribute"
            className="ruled-cell hover:bg-secondary group flex flex-col p-8 transition-colors"
          >
            <h2 className="text-title text-muted-foreground">
              More datasets in progress
            </h2>
            <p className="text-body-sm text-muted-foreground mt-2 flex-1">
              Contribute sentences in your dialect to help publish the next one.
            </p>
            <PixelIcon
              name="chevron-right"
              className="text-muted-foreground mt-8 size-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </RuledGrid>
      </section>
    </div>
  );
}
