"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface DialectLinkCardProps {
  href: string;
  title: string;
  subtitle: string;
}

export default function DialectLink({
  href,
  title,
  subtitle,
}: DialectLinkCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    router.push(href);
  };

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        className="
          group
          rounded-xl p-5
          bg-white/80 dark:bg-black/40
          backdrop-blur-md
          border border-black/10 dark:border-white/10
          transition
          hover:scale-[1.02]
          hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-amber-400
          cursor-pointer
        "
      >
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-sm opacity-70 mt-1">{subtitle}</p>
      </a>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto"></div>
            <p className="mt-2 text-lg">Loading {title}...</p>
          </div>
        </div>
      )}
    </>
  );
}
