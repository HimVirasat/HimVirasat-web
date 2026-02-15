import Image from "next/image";
import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { datasets } from "@/lib/dataset-utils";

export default function DatasetsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/mountains1.png"
          alt="Mountain background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/60 dark:bg-black/85" />

      <main className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-6xl px-6 sm:px-10 w-full">
          <span className="uppercase tracking-widest text-xs opacity-70 font-semibold">
            Language & Culture
          </span>

          <h1 className="mt-2 text-4xl md:text-5xl font-semibold">Datasets</h1>

          <p className="mt-4 text-lg max-w-xl opacity-80 leading-relaxed">
            Download curated linguistic datasets preserving Himachali dialects
            for research, NLP, and cultural documentation.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <Card
                key={dataset.id}
                className="bg-background/80 backdrop-blur-md shadow-xl border border-border/50"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{dataset.name}</CardTitle>
                    <Badge variant="secondary">{dataset.version}</Badge>
                  </div>
                  <CardDescription>{dataset.language}</CardDescription>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Open-source structured vocabulary dataset suitable for
                    linguistic research, NLP training, and documentation.
                  </p>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                  {/* Download ZIP */}
                  <Button
                    asChild
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Link href={dataset.datasetLink} target="_blank">
                      Download Dataset (ZIP)
                    </Link>
                  </Button>

                  {/* Kaggle */}
                  <Button asChild variant="outline" className="w-full">
                    <Link href={dataset.kaggleLink} target="_blank">
                      View on Kaggle
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 
                               bg-white dark:bg-zinc-900 
                               hover:bg-zinc-100 dark:hover:bg-zinc-800
                               border border-border"
                  >
                    <Link href={dataset.githubLink} target="_blank">
                      <SiGithub size={16} />
                      View on GitHub
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
