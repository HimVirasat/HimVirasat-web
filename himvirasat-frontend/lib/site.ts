export const site = {
  name: "HimVirasat",
  nativeName: "हिमविरासत",
  takriName: "𑚩𑚮𑚢𑚦𑚮𑚤𑚭𑚨𑚙",
  tagline: "Preserving Himachal's Linguistic Heritage",
  description:
    "HimVirasat is an open source initiative, driven by the community, documenting and preserving the languages and dialects of Himachal Pradesh through open translation datasets, vocabulary archives, and script tools.",
  // TODO(maintainers): set NEXT_PUBLIC_SITE_URL to the canonical domain.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com/HimVirasat",
    repo: "https://github.com/HimVirasat/HimVirasat-web",
    discordHimvirasat: "https://discord.gg/PgJWcFXRTB",
    discordHpCommunity: "https://discord.gg/wHjT3vMAVx",
  },
} as const;
