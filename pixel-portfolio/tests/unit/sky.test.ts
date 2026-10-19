import { describe, expect, it } from "vitest";
import { preflightScript } from "@/os/preflight";
import { skyVars } from "@/os/sky";

const at = (iso: string) => skyVars(Date.parse(iso));
const elevation = (iso: string) => Number(at(iso)["--sun-elevation"]);

describe("the London sky", () => {
  it("puts the sun where it really is over London", () => {
    expect(elevation("2026-06-21T12:00:00Z")).toBeGreaterThan(60);
    expect(elevation("2026-06-21T12:00:00Z")).toBeLessThan(63);
    expect(elevation("2026-12-21T12:00:00Z")).toBeGreaterThan(13);
    expect(elevation("2026-12-21T12:00:00Z")).toBeLessThan(16);
    // Sunrise on 20 October is about 07:30 BST.
    expect(Math.abs(elevation("2026-10-20T06:30:00Z"))).toBeLessThan(2);
    expect(elevation("2026-10-20T23:00:00Z")).toBeLessThan(-30);
  });

  it("shows stars and city lights at night, and neither at midday", () => {
    const night = at("2026-10-20T23:00:00Z"), noon = at("2026-10-20T11:30:00Z");
    expect(night["--sky-stars"]).toMatch(/\/ 0\.9\d\)$/);
    expect(night["--city-lights"]).toBe("1.00");
    expect(noon["--sky-stars"]).toMatch(/\/ 0\.00\)$/);
    expect(noon["--city-lights"]).toBe("0.00");
  });

  it("keeps the menu bar readable: white text on a dark sky", () => {
    expect(at("2026-10-20T23:00:00Z")["--sky-text"]).toBe("#fff");
  });

  it("still works when inlined into the pre-paint script as source", () => {
    // The pre-paint script embeds skyVars with toString(), so it must not depend on anything outside itself.
    const inlined = new Function(`return (${skyVars.toString()})`)() as typeof skyVars;
    const time = Date.parse("2026-10-20T17:00:00Z");
    expect(inlined(time)).toEqual(skyVars(time));
  });

  it("produces a pre-paint script that parses", () => {
    expect(() => new Function(preflightScript)).not.toThrow();
  });
});
