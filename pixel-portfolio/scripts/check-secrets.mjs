// Runs after every build (npm "postbuild"). Fails if a secret's value appears
// anywhere in the build output, e.g. after an accidental NEXT_PUBLIC_ prefix.
// It reports the variable name and file, never the value.
import nextEnv from "@next/env";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error: console.error });

const names = ["ANTHROPIC_API_KEY", "ELEVENLABS_API_KEY", "KV_REST_API_TOKEN", "KV_REST_API_READ_ONLY_TOKEN", "KV_URL", "REDIS_URL", "UPSTASH_REDIS_REST_TOKEN"];
const secrets = names.map(name => [name, process.env[name]?.trim()]).filter(([, value]) => value && value.length >= 16);
const anthropicKeyShape = /sk-ant-[A-Za-z0-9_-]{20,}/;

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "cache") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (entry.isFile()) yield path;
    else if (entry.isSymbolicLink()) {
      // Vercel's build output links to dependencies outside .next. Scan linked
      // files, but don't follow linked folders (they aren't build output and
      // could loop); skip broken links.
      try { if (statSync(path).isFile()) yield path; } catch { /* Broken link. */ }
    }
  }
}

const leaks = [];
for (const file of files(".next")) {
  const text = readFileSync(file, "latin1");
  for (const [name, value] of secrets) if (text.includes(value)) leaks.push(`${name} in ${file}`);
  if (anthropicKeyShape.test(text)) leaks.push(`something shaped like an Anthropic key in ${file}`);
}

if (leaks.length) {
  console.error(`\n✗ Secret check failed. Found:\n  ${[...new Set(leaks)].join("\n  ")}\n`);
  process.exit(1);
}
console.log(`✓ Secret check passed: ${secrets.length} secret value(s) and the Anthropic key pattern are absent from the build.`);
