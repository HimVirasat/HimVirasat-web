import Link from "next/link";

import { Eyebrow } from "@/components/mistral/eyebrow";
import { TakriMosaic } from "@/components/mistral/takri-mosaic";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="mx-auto flex w-full max-w-prose flex-1 flex-col justify-center px-6 py-24 text-center">
        <Eyebrow size="lg" className="justify-center">
          Error 404
        </Eyebrow>
        <h1 className="text-display-md md:text-display-xl mt-6 text-balance">
          This trail does not exist.
        </h1>
        <p className="text-body-lg text-muted-foreground mx-auto mt-6 max-w-md">
          The page you are looking for may have been moved or renamed.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/">Back to the homepage</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/vocabulary">Search the vocabulary</Link>
          </Button>
        </div>
      </main>
      <TakriMosaic variant="band" seed={404} />
    </div>
  );
}
