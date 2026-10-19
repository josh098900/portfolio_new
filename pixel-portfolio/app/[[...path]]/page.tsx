import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/content/projects";
import { defaultShareImage, siteName } from "@/lib/site";
import { allPaths, homeRoute, parsePath, routeTitle, routeToPath } from "@/os/routes";
import { System } from "@/os/system";

// One route for every URL, so moving between apps never remounts the OS.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ path: [] }, ...allPaths().map(path => ({ path }))];
}

export async function generateMetadata({ params }: PageProps<"/[[...path]]">): Promise<Metadata> {
  const { path = [] } = await params;
  const route = parsePath(path);
  if (!route) return {};
  const { title, description } = routeTitle(route);
  if (route === homeRoute) return { alternates: { canonical: "/" } };
  // Project pages share their own screenshot; everything else uses the desktop shot.
  const project = route.app === "projects" ? projects.find(p => p.slug === route.sub[0]) : undefined;
  const image = project?.image ? { url: project.image, width: 1280, height: 720, alt: project.imageAlt ?? project.title } : defaultShareImage;
  return {
    title,
    description,
    alternates: { canonical: routeToPath(route) },
    openGraph: { type: "website", siteName, title: `${title} · Josh`, description, url: routeToPath(route), images: [image] },
  };
}

export default async function Page({ params }: PageProps<"/[[...path]]">) {
  const { path = [] } = await params;
  const route = parsePath(path);
  if (!route) notFound();
  return <System initial={route} />;
}
