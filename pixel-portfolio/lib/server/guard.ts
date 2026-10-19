import "server-only";
import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Abuse protection shared by /api/chat and /api/speak. On Vercel it uses the
// Upstash Redis store (the KV_* variables from the Vercel integration). Locally,
// without those variables, it falls back to memory so development still works.

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

/** On Vercel without Redis we refuse requests rather than run without limits. */
export const guardAvailable = Boolean(redis) || process.env.VERCEL !== "1";

type Window = { limit: number; seconds: number };
type Rule = { name: string; window: Window; global?: boolean };

export const rules = {
  chat: [
    { name: "chat-minute", window: { limit: 8, seconds: 60 } },
    { name: "chat-day", window: { limit: 40, seconds: 86_400 } },
    { name: "chat-all-day", window: { limit: 600, seconds: 86_400 }, global: true },
  ],
  voice: [
    { name: "voice-day", window: { limit: 10, seconds: 86_400 } },
    { name: "voice-all-day", window: { limit: 60, seconds: 86_400 }, global: true },
  ],
} satisfies Record<string, Rule[]>;

const limiters = new Map<string, Ratelimit>();
function limiter(rule: Rule) {
  let found = limiters.get(rule.name);
  if (!found) {
    const { limit, seconds } = rule.window;
    found = new Ratelimit({
      redis: redis!,
      prefix: `portfolio:${rule.name}`,
      limiter: seconds <= 60 ? Ratelimit.slidingWindow(limit, `${seconds} s`) : Ratelimit.fixedWindow(limit, `${seconds} s`),
    });
    limiters.set(rule.name, found);
  }
  return found;
}

const memory = new Map<string, { count: number; resetAt: number }>();
function memoryLimit(key: string, { limit, seconds }: Window) {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + seconds * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

/** Visitors are identified by a hash of their IP address, never the address itself. */
export function visitorId(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`josh-portfolio:${ip}`).digest("hex").slice(0, 32);
}

export type LimitResult = { ok: true } | { ok: false; scope: "visitor" | "everyone" };

export async function checkLimits(kind: keyof typeof rules, visitor: string): Promise<LimitResult> {
  for (const rule of rules[kind] as Rule[]) {
    const id = rule.global ? "all" : visitor;
    const allowed = redis ? (await limiter(rule).limit(id)).success : memoryLimit(`${rule.name}:${id}`, rule.window);
    if (!allowed) return { ok: false, scope: rule.global ? "everyone" : "visitor" };
  }
  return { ok: true };
}

/** Only pages on this site may call the API from a browser. */
export function sameOrigin(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

// Finished replies are kept for an hour so /api/speak can voice them. It accepts
// only these IDs, so it can never be used to read out arbitrary text.
const REPLY_TTL = 3600;
const replies = new Map<string, { text: string; expires: number }>();

export async function saveReply(id: string, text: string) {
  if (redis) await redis.set(`portfolio:reply:${id}`, text, { ex: REPLY_TTL });
  else replies.set(id, { text, expires: Date.now() + REPLY_TTL * 1000 });
}

export async function findReply(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) return null;
  if (redis) return await redis.get<string>(`portfolio:reply:${id}`);
  const entry = replies.get(id);
  return entry && entry.expires > Date.now() ? entry.text : null;
}

export function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
