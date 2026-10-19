import { describe, expect, it } from "vitest";
import { letterboxdUser } from "@/content/links";
import { allPaths, appIds, apps, homeRoute, parsePath, pathFromUrl, readyApps, routeTitle, routeToPath } from "@/os/routes";

describe("routes", () => {
  it("round-trips every page URL", () => {
    for (const segments of allPaths()) {
      const route = parsePath(segments);
      expect(route, `/${segments.join("/")}`).not.toBeNull();
      expect(pathFromUrl(routeToPath(route!))).toEqual(route);
    }
  });

  it("serves the About note at the root", () => {
    expect(parsePath([])).toEqual(homeRoute);
    expect(routeToPath(homeRoute)).toBe("/");
  });

  it("rejects pages that don't exist", () => {
    for (const path of ["/nope", "/projects/nope", "/notes/about/extra", "/settings/nope", "/arcade/nope", "/music/extra", "/api/chat"]) {
      expect(pathFromUrl(path), path).toBeNull();
    }
  });

  it("decodes encoded segments", () => {
    expect(pathFromUrl("/projects/academy%2Dfantasy")).toEqual({ app: "projects", sub: ["academy-fantasy"] });
  });

  it("keeps unfinished apps out of every URL", () => {
    for (const app of appIds.filter(id => !apps[id].ready)) {
      expect(pathFromUrl(`/${app}`), app).toBeNull();
      expect(allPaths().some(([first]) => first === app), app).toBe(false);
    }
  });

  it("shows TV only once a Letterboxd username is set", () => {
    expect(apps.tv.ready).toBe(Boolean(letterboxdUser));
    expect(readyApps.includes("tv")).toBe(Boolean(letterboxdUser));
  });

  it("gives every page a title and a description", () => {
    for (const segments of [[], ...allPaths()]) {
      const { title, description } = routeTitle(parsePath(segments)!);
      expect(title.trim(), `/${segments.join("/")}`).not.toBe("");
      expect(description.trim(), `/${segments.join("/")}`).not.toBe("");
    }
  });
});
