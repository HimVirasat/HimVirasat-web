import Link from "next/link";

type DialectCardProps = {
  name: string;
  formUrl: string;
};

export default function DialectCard({ name, formUrl }: DialectCardProps) {
  return (
    <div className="rounded-2xl bg-white/90 p-6 shadow dark:bg-zinc-900/80">
      <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
        {name}
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
        Contribute everyday sentences and Hindi translations in the {name}{" "}
        dialect.
      </p>

      <Link
        href={formUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Contribute to {name}
      </Link>
    </div>
  );
}
