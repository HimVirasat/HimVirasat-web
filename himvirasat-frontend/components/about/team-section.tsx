"use client";

import type { ElementType } from "react";
import { Crown, Code2, Languages, Mail } from "lucide-react";
import {
  FaGithub,
  FaDiscord,
  FaRedditAlien,
  FaXTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa6";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex flex-wrap items-center justify-center gap-2">
      {socials.map((social) => {
        const Icon = SOCIAL_ICONS[social.platform];

        return (
          <a
            key={`${social.platform}-${social.url}`}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${social.platform} profile`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border 
            border-emerald-500/15 bg-emerald-500/5 text-slate-600 
            transition-colors hover:bg-emerald-500/10 hover:text-emerald-700 
            dark:text-zinc-300 dark:hover:text-emerald-400"
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}

function PersonCard({
  member,
  size = "md",
}: {
  member: TeamMember;
  size?: "lg" | "md" | "sm";
}) {
  const cardPadding = size === "lg" ? "p-6" : size === "md" ? "p-5" : "p-4";
  const avatarSize =
    size === "lg" ? "h-20 w-20" : size === "md" ? "h-16 w-16" : "h-14 w-14";
  const nameSize =
    size === "lg" ? "text-lg" : size === "md" ? "text-base" : "text-sm";
  const roleSize = size === "lg" ? "text-md" : "text-[12px]";

  return (
    <Card className="h-full border-white/20 bg-white/45 dark:bg-white/5">
      <CardContent
        className={cn(cardPadding, "flex flex-col items-center text-center")}
      >
        <Avatar className={cn(avatarSize, "ring-2 ring-emerald-500/25")}>
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
            {initials(member.name)}
          </AvatarFallback>
        </Avatar>

        <h3
          className={cn(
            "mt-3 font-semibold text-slate-900 dark:text-white",
            nameSize
          )}
        >
          {member.name}
        </h3>

        <p
          className={cn(
            "mt-1 uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-semibold",
            roleSize
          )}
        >
          {member.role}
        </p>

        {member.languages?.length ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {member.languages.map((language) => (
              <Badge
                key={language}
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              >
                {language}
              </Badge>
            ))}
          </div>
        ) : null}

        {member.socials?.length ? (
          <div className="mt-4">
            <SocialRow socials={member.socials} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ConnectorLine() {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <div className="my-8 h-20 w-px bg-linear-to-b from-emerald-500/80 to-emerald-500/80" />
    </div>
  );
}

function SectionShell({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-white/20 bg-white/40 backdrop-blur-none dark:bg-white/5">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

        {children}
      </CardContent>
    </Card>
  );
}

export function TeamSection() {
  return (
    <section className="mt-32 scroll-mt-24">
      <div className="mb-16 text-center">
        <span className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          <Crown className="h-3.5 w-3.5" />
          Our Team
        </span>

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
          The People Behind HimVirasat
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-zinc-400">
          A growing community of developers, researchers, language experts, and
          contributors working together to preserve Himachal&apos;s linguistic
          heritage.
        </p>
      </div>

      <div className="space-y-12">
        <SectionShell
          icon={Code2}
          title="Technical Team"
          subtitle="The technical branch is responsible for developing HimVirasat's platform, infrastructure, 
          and the systems that power dataset generation, validation, and public releases."
        >
          <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
            {TECH_LEADS.map((member) => (
              <PersonCard key={member.name} member={member} size="md" />
            ))}
          </div>

          <ConnectorLine />
          <div className="text-center">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
              Developers
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              Developers and researchers building the technical foundation of
              HimVirasat.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DEVELOPERS.map((member) => (
              <PersonCard key={member.name} member={member} size="md" />
            ))}
          </div>
        </SectionShell>

        <SectionShell
          icon={Languages}
          title="Language Team"
          subtitle="The language branch is organized around heads and contributors, keeping each dialect or language stream active and easy to grow."
        >
          <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
            {LANGUAGE_HEADS.map((member) => (
              <PersonCard key={member.name} member={member} size="md" />
            ))}
          </div>

          <ConnectorLine />

          <div className="text-center">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
              Contributors
            </h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              Contributors helping preserve and document Himachali languages.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CONTRIBUTORS.map((member) => (
              <PersonCard key={member.name} member={member} size="md" />
            ))}
          </div>
        </SectionShell>
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
  email: Mail,
};
