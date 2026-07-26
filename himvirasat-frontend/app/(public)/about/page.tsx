import Link from "next/link";

import { TeamSection } from "@/components/about/team-section";
import { InkBand } from "@/components/mistral/ink-band";
import { RuledCell, RuledGrid } from "@/components/mistral/ruled-grid";
import { SectionHeading } from "@/components/mistral/section-heading";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { devToTankri } from "@/lib/transliteration/devToTankri";

export const metadata = {
  title: "About & Team",
  description:
    "From maintaining a digital archive to developing open source Pahadi learning tools, HimVirasat is building the infrastructure for Himachal's digital future.",
};

const commitments = [
  {
    title: "Collaborative engineering",
    body: "Today we gather data through structured community forms. A dedicated contribution platform, built by the community for the community, is next.",
  },
  {
    title: "Open learning",
    body: "Free tools that help the next generation learn their mother tongue, blending traditional knowledge with modern language technology.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <header className="mx-auto w-full max-w-content px-6 py-20 md:py-28 lg:px-10">
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="Our vision"
          nativeEcho={devToTankri("दृष्टि")}
          title="Bridging heritage and innovation."
        />
      </header>

      <InkBand>
        <div className="mx-auto w-full max-w-content px-6 py-20 md:py-28 lg:px-10">
          <h2 className="text-display-md max-w-3xl text-balance">
            Beyond just words.
          </h2>
          <p className="text-body-lg mt-6 max-w-3xl text-muted-foreground">
            HimVirasat is not only a dictionary, it is a technical ecosystem.
            From maintaining this digital archive to developing{" "}
            <strong className="font-medium text-foreground">
              open source Pahadi learning tools
            </strong>
            , we are building the infrastructure for Himachal&rsquo;s digital
            future. The work scales from{" "}
            <strong className="font-medium text-foreground">
              specialised language models
            </strong>{" "}
            to live{" "}
            <strong className="font-medium text-foreground">
              dialect translators
            </strong>
            .
          </p>
        </div>
      </InkBand>

      <section className="mx-auto w-full max-w-content px-6 py-20 md:py-28 lg:px-10">
        <RuledGrid cols={2}>
          {commitments.map((item) => (
            <RuledCell key={item.title} className="p-8 lg:p-10">
              <h3 className="text-title">{item.title}</h3>
              <p className="text-body-sm text-muted-foreground mt-3">
                {item.body}
              </p>
            </RuledCell>
          ))}
        </RuledGrid>
      </section>

      <section className="border-border border-y">
        <div className="mx-auto w-full max-w-content px-6 py-20 text-center md:py-24 lg:px-10">
          <h2 className="text-display-md text-balance">
            Become part of the movement.
          </h2>
          <p className="text-body-lg text-muted-foreground mx-auto mt-5 max-w-2xl">
            Whether you are a native speaker, a linguist, or a developer, your
            contribution matters.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/contribute">Contribute data</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a
                href={site.links.discordHimvirasat}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Discord
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div
        id="team"
        className="mx-auto w-full max-w-content scroll-mt-24 px-6 lg:px-10"
      >
        <TeamSection />
      </div>
    </div>
  );
}
