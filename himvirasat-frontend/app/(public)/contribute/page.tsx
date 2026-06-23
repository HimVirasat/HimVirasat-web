import { BackgroundDecor } from "@/components/layout/background-decor";
import DialectCard from "@/components/dialects/DialectCard";

export default function ContributePage() {
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundDecor overlayClassName="bg-white/60 dark:bg-black/85" />

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-24 sm:px-12">
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Language & Translation Contributions
          </h2>

          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
            Choose your dialect below and contribute parallel sentences to help
            build open Hindi ↔ Himachali translation datasets for research,
            education, and language tools.
          </p>

          <h3 className="mt-12 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            🌱 Your Words Matter
          </h3>

          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
            Every word you contribute helps keep Himachal’s languages alive in
            the digital world. Even a single word or sentence from your dialect
            is valuable. It captures how people actually speak, something no
            book or machine can recreate.
          </p>

          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
            All contributions to HimVirasat are carefully tracked and verified,
            ensuring that your effort is never lost or overlooked. As the
            project grows, contributors will be recognized and credited across
            our official platforms, including the HimVirasat website, our
            official Discord server, and community posts on Reddit.
          </p>

          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
            You don’t need to be an expert. Just write the words you use every
            day — that’s how a language truly lives on.
          </p>

          <p className="mt-4 font-medium text-zinc-900 dark:text-zinc-100">
            One word today can preserve a language tomorrow.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {dialects.map((dialect) => (
              <DialectCard
                key={dialect.id}
                name={dialect.name}
                formUrl={dialect.formUrl}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}