"use client";

import type { ElementType } from "react";
import {
  FaDiscord,
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaRedditAlien,
  FaXTwitter,
} from "react-icons/fa6";

import { Eyebrow } from "@/components/mistral/eyebrow";
import { RuledGrid } from "@/components/mistral/ruled-grid";
import { SectionHeading } from "@/components/mistral/section-heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function SocialRow({ socials }: { socials?: SocialLink[] }) {
  if (!socials?.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {socials.map((social) => {
        const Icon = SOCIAL_ICONS[social.platform];

        return (
          <a
            key={`${social.platform}-${social.url}`}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${social.platform} profile`}
            className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex size-8 items-center justify-center rounded-md border transition-colors"
          >
            <Icon className="size-3.5" />
          </a>
        );
      })}
    </div>
  );
}

function PersonCard({ member }: { member: TeamMember }) {
  return (
    <div className="ruled-cell flex flex-col p-8">
      <Avatar className="border-border size-16 border">
        <AvatarImage src={member.avatar} alt={member.name} />
        <AvatarFallback className="bg-pine-100 text-[#07070b]">
          {initials(member.name)}
        </AvatarFallback>
      </Avatar>

      <h3 className="text-title mt-5">{member.name}</h3>
      <Eyebrow className="mt-2">{member.role}</Eyebrow>

      {member.languages?.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {member.languages.map((language) => (
            <span
              key={language}
              className="animate-pop-in border-border text-body-sm text-muted-foreground rounded-md border px-2.5 py-0.5"
            >
              {language}
            </span>
          ))}
        </div>
      ) : null}

      {member.socials?.length ? (
        <div className="mt-6">
          <SocialRow socials={member.socials} />
        </div>
      ) : null}
    </div>
  );
}

function OpenSlot() {
  return (
    <div className="border-border border border-dashed p-8 text-center">
      <p className="text-title text-muted-foreground">Your name here</p>
      <p className="text-body-sm text-muted-foreground mt-2">
        <a
          href={site.links.discordHimvirasat}
          target="_blank"
          rel="noopener noreferrer"
          className="link-quiet underline underline-offset-4"
        >
          Join the Discord and start contributing.
        </a>
      </p>
    </div>
  );
}

function TeamBranch({
  eyebrow,
  title,
  subtitle,
  leads,
  membersHeading,
  membersSubtitle,
  members,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  leads: TeamMember[];
  membersHeading: string;
  membersSubtitle: string;
  members: TeamMember[];
  className?: string;
}) {
  return (
    <section className={cn("border-border border-t pt-16", className)}>
      <Eyebrow size="lg">{eyebrow}</Eyebrow>
      <h3 className="text-display-md mt-4 text-balance">{title}</h3>
      <p className="text-body text-muted-foreground mt-4 max-w-2xl">
        {subtitle}
      </p>

      <RuledGrid cols={2} className="mt-10">
        {leads.map((member) => (
          <PersonCard key={member.name} member={member} />
        ))}
      </RuledGrid>

      <div className="mt-14">
        <h4 className="text-title">{membersHeading}</h4>
        <p className="text-body-sm text-muted-foreground mt-2 max-w-2xl">
          {membersSubtitle}
        </p>

        {members.length > 0 ? (
          <RuledGrid cols="2-3" className="mt-8">
            {members.map((member) => (
              <PersonCard key={member.name} member={member} />
            ))}
          </RuledGrid>
        ) : (
          <div className="mt-8">
            <OpenSlot />
          </div>
        )}
      </div>
    </section>
  );
}

export function TeamSection() {
  return (
    <section className="scroll-mt-24 py-24 md:py-32">
      <SectionHeading
        eyebrow="Our team"
        title="The people behind HimVirasat."
        description="A growing community of developers, researchers, language experts, and contributors working together to preserve Himachal's linguistic heritage."
      />

      <div className="mt-20 flex flex-col gap-20">
        <TeamBranch
          eyebrow="Technical team"
          title="Building the platform."
          subtitle="The technical branch develops HimVirasat's platform, infrastructure, and the systems that power dataset generation, validation, and public releases."
          leads={TECH_LEADS}
          membersHeading="Developers"
          membersSubtitle="Developers and researchers building the technical foundation of HimVirasat."
          members={DEVELOPERS}
          className="border-t-0 pt-0"
        />

        <TeamBranch
          eyebrow="Language team"
          title="Keeping each dialect active."
          subtitle="The language branch is organised around heads and contributors, keeping each dialect or language stream active and easy to grow."
          leads={LANGUAGE_HEADS}
          membersHeading="Contributors"
          membersSubtitle="Contributors helping preserve and document Himachali languages."
          members={CONTRIBUTORS}
        />
      </div>
    </section>
  );
}

type SocialPlatform =
  | "github"
  | "discord"
  | "reddit"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "email";

interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
  socials?: SocialLink[];
  languages?: string[];
}

const TECH_LEADS: TeamMember[] = [
  {
    name: "Jasper Strauss",
    role: "Lead Developer",
    avatar: "/team/jasper.png",
    socials: [
      { platform: "github", url: "https://github.com/DrLestrange" },
      {
        platform: "discord",
        url: "https://discord.com/users/1011937653203144715",
      },
      { platform: "email", url: "mailto:casesilver777@gmail.com" },
    ],
  },
  {
    name: "Headlock",
    role: "Lead ML Researcher",
    avatar: "/team/headlock.png",
    socials: [
      { platform: "github", url: "https://github.com/Arkur745" },
      {
        platform: "discord",
        url: "https://discord.com/users/1466294408604418230",
      },
    ],
  },
];

const DEVELOPERS: TeamMember[] = [
  // {
  //   name: "Developer One",
  //   role: "Frontend Developer",
  //   avatar: "/team/dev1.png",
  //   socials: [{ platform: "github", url: "#" }],
  // },
];

const LANGUAGE_HEADS: TeamMember[] = [
  {
    name: "Ryan Gvriluk",
    role: "Head of Languages",
    avatar: "/team/ryan.png",
    languages: ["Mandyali", "Kangri"],
    socials: [
      {
        platform: "discord",
        url: "https://discord.com/users/1308474011151372376",
      },
      {
        platform: "instagram",
        url: "https://www.instagram.com/_ryan_sharma?igsh=cjF1cnB1OTNkNHIw",
      },
    ],
  },
  {
    name: "Moyo Mc Spicy",
    role: "Head of Languages",
    avatar: "/team/moyo.png",
    languages: ["Kangri"],
    socials: [
      {
        platform: "discord",
        url: "https://discord.com/users/207767720081620993",
      },
    ],
  },
];

const CONTRIBUTORS: TeamMember[] = [
  // {
  //   name: "Contributor A",
  //   role: "Data Contributor",
  //   avatar: "/team/contributor-a.png",
  //   languages: ["Mandyali"],
  //   socials: [
  //     { platform: "github", url: "#" },
  //     { platform: "reddit", url: "#" },
  //   ],
  // },
];

const SOCIAL_ICONS: Record<SocialPlatform, ElementType> = {
  github: FaGithub,
  discord: FaDiscord,
  reddit: FaRedditAlien,
  twitter: FaXTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  email: FaEnvelope,
};
