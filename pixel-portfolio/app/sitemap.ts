import type { MetadataRoute } from "next";
import { allPaths } from "@/os/routes";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [[], ...allPaths()].map(path => ({ url: `${siteUrl}/${path.join("/")}` }));
}
