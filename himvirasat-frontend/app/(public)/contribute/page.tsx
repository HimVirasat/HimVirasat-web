import type { Metadata } from "next";

import DialectCard from "@/components/dialects/DialectCard";
import { Eyebrow } from "@/components/mistral/eyebrow";
import { RuledGrid } from "@/components/mistral/ruled-grid";
import { SectionHeading } from "@/components/mistral/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { devToTankri } from "@/lib/transliteration/devToTankri";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Contribute translation sentences in your Himachali dialect through simple forms.",
};

const dialects = [
  {
    id: "kangri",
    name: "Kangri",
    formUrl: "https://forms.gle/fgENxd2t5a62vuBSA",
  },
  {
    id: "mandeali",
    name: "Mandeali",
    formUrl: "https://forms.gle/ApxgyyQGswns7uwM8",
  },
  {
    id: "kullvi",
    name: "Kullvi",
    formUrl: "https://forms.gle/Gnecc3PWtYFz4v7w6",
  },
  {
    id: "mahasuvi_western",
    name: "Mahasuvi (Western)",
    formUrl: "https://forms.gle/dgPsVoDyhW8hGG1n9",
  },
  {
    id: "mahasuvi_eastern",
    name: "Mahasuvi (Eastern)",
    formUrl: "https://forms.gle/2aec4T8BYCGdv5vy9",
  },
  {
    id: "kinnauri",
    name: "Kinnauri",
    formUrl: "https://forms.gle/ptALNWptVu7PFcN4A",
  },
];

const steps = [
  {
    numeral: "𑛁",
    title: "Pick your dialect",
    line: "Choose your dialect from the forms below.",
  },
  {
    numeral: "𑛂",
    title: "Write everyday sentences",
    line: "Write the words you use every day, with their Hindi translations, in the form.",
  },
  {
    numeral: "𑛃",
    title: "Reviewed and credited",
    line: "Every contribution is tracked and verified, and contributors are recognised and credited.",
  },
];

export default function ContributePage() {
  return (
    <div className="mx-auto w-full max-w-content px-6 py-20 md:py-28 lg:px-10">
      <SectionHeading
        as="h1"
        align="left"
        eyebrow="Contribute"
        nativeEcho={devToTankri("योगदान")}
        title="Language and translation contributions"
        description="Choose your dialect below and contribute parallel sentences to help build open Hindi to Himachali translation datasets for research, education, and language tools."
      />

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="text-body text-muted-foreground max-w-prose space-y-5">
          <h2 className="text-display-md text-foreground">
            Your words matter
          </h2>
          <p>
            Every word you contribute helps keep Himachal&rsquo;s languages
            alive in the digital world. Even a single word or sentence from your
            dialect is valuable. It captures how people actually speak,
            something no book or machine can recreate.
          </p>
          <p>
            All contributions to HimVirasat are carefully tracked and verified,
            ensuring your effort is never lost or overlooked. As the project
            grows, contributors will be recognised and credited across our
            official platforms, including the HimVirasat website, our Discord
            server, and community posts.
          </p>
          <p>
            You do not need to be an expert. Just write the words you use every
            day. That is how a language truly lives on.
          </p>
        </div>

        <blockquote className="border-pine-500 text-title text-foreground h-fit border-l-2 pl-6">
          One word today can preserve a language tomorrow.
        </blockquote>
      </div>

      <section aria-label="How contributing works" className="mt-20">
        <Eyebrow className="mb-6">How it works</Eyebrow>
        <RuledGrid cols={3} as="ol">
          {steps.map((step) => (
            <li key={step.title} className="ruled-cell p-8">
              <span
                aria-hidden
                className="bg-pine-100 font-takri grid size-12 place-items-center text-2xl text-[#07070b]"
              >
                {step.numeral}
              </span>
              <h3 className="text-title mt-5">{step.title}</h3>
              <p className="text-body-sm text-muted-foreground mt-2">
                {step.line}
              </p>
            </li>
          ))}
        </RuledGrid>
      </section>

      <section aria-label="Dialect forms" className="mt-20">
        <Eyebrow className="mb-6">Dialects collecting now</Eyebrow>
        <RuledGrid cols="2-3" as="ul">
          {dialects.map((dialect, index) => (
            <Reveal
              as="li"
              key={dialect.id}
              delay={index * 60}
              className="ruled-cell h-full"
            >
              <DialectCard name={dialect.name} formUrl={dialect.formUrl} />
            </Reveal>
          ))}
        </RuledGrid>
      </section>
    </div>
  );
}
