export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export const actionButtonStyles =
  "rounded-full px-6 font-medium transition-all duration-200 " +
  "shadow-sm backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-md";

export const primaryButtonStyles =
  actionButtonStyles +
  " bg-emerald-600 text-white hover:bg-emerald-700 " +
  "dark:bg-emerald-600 dark:hover:bg-emerald-700";

export const secondaryButtonStyles =
  actionButtonStyles +
  " bg-white/95 text-zinc-900 ring-1 ring-black/10 " +
  "hover:bg-white dark:bg-zinc-900 dark:text-zinc-100 " +
  "dark:ring-white/10 dark:hover:bg-zinc-800";
