import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { SYSTEM_PROMPT } from "@/lib/server/assistant";
import { resumeText } from "@/content/resume";

// Josh is contacted through LinkedIn and GitHub only, so no email address or
// phone number may appear anywhere a visitor (or the assistant) can read.

const root = join(__dirname, "../..");
const email = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const phone = /(?:\+44\s?\(?0?\)?\s?7\d{3}|\b07\d{3})\s?\d{3}\s?\d{3}\b/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const source = ["app", "apps", "content", "lib", "os"].flatMap(dir => files(join(root, dir))).filter(path => /\.(tsx?|css|json|mdx?)$/.test(path));

describe("privacy", () => {
  it("never shows an email address or phone number in the site's content", () => {
    for (const path of files(join(root, "content"))) {
      const text = readFileSync(path, "utf8");
      expect(text, relative(root, path)).not.toMatch(email);
      expect(text, relative(root, path)).not.toMatch(phone);
    }
  });

  it("never gives the assistant an email address or phone number", () => {
    for (const text of [SYSTEM_PROMPT, resumeText()]) {
      expect(text).not.toMatch(email);
      expect(text).not.toMatch(phone);
    }
  });

  it("publishes no PDFs, such as the original CV", () => {
    expect(files(join(root, "public")).filter(path => path.toLowerCase().endsWith(".pdf"))).toEqual([]);
  });

  it("keeps secrets out of the browser: nothing uses NEXT_PUBLIC_ variables", () => {
    for (const path of source) expect(readFileSync(path, "utf8"), relative(root, path)).not.toMatch(/NEXT_PUBLIC_/);
  });

  it("ships .env.example with names only, never values", () => {
    const lines = readFileSync(join(root, ".env.example"), "utf8").split("\n").filter(line => line.trim() && !line.trim().startsWith("#"));
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) expect(line, line).toMatch(/^[A-Z0-9_]+=\s*$/);
  });
});
