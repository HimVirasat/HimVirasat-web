import type { MetadataRoute } from "next";

import { site } from "@/lib/site";
import { dialectsConfig } from "@/lib/dialects/dialect-config";

const staticRoutes = [
  "/",
  "/about",
  "/contribute",
  "/datasets",
  "/tools",
  "/tools/transliterator",
  "/vocabulary",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ...staticRoutes,
    ...dialectsConfig.map((dialect) => `/vocabulary/${dialect.id}`),
  ];

  return routes.map((path) => ({
    url: new URL(path, site.url).toString(),
  }));
}
