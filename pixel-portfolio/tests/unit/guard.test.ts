import { describe, expect, it } from "vitest";
import { checkLimits, findReply, rules, sameOrigin, saveReply, visitorId } from "@/lib/server/guard";

const request = (headers: Record<string, string>) => new Request("http://localhost:3000/api/chat", { method: "POST", headers });

describe("sameOrigin", () => {
  it("accepts requests from this site", () => {
    expect(sameOrigin(request({ host: "localhost:3000", origin: "http://localhost:3000", "sec-fetch-site": "same-origin" }))).toBe(true);
  });

  it("refuses other sites, missing origins and bad origins", () => {
    expect(sameOrigin(request({ host: "localhost:3000", origin: "https://evil.example" }))).toBe(false);
    expect(sameOrigin(request({ host: "localhost:3000", origin: "http://localhost:3000", "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(sameOrigin(request({ host: "localhost:3000" }))).toBe(false);
    expect(sameOrigin(request({ host: "localhost:3000", origin: "not a url" }))).toBe(false);
  });
});

describe("visitorId", () => {
  it("is a stable hash that never contains the IP address", () => {
    const a = visitorId(request({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }));
    expect(a).toMatch(/^[a-f0-9]{32}$/);
    expect(a).not.toContain("203.0.113.7");
    expect(visitorId(request({ "x-forwarded-for": "203.0.113.7" }))).toBe(a);
    expect(visitorId(request({ "x-forwarded-for": "203.0.113.8" }))).not.toBe(a);
  });
});

describe("checkLimits", () => {
  it("allows a visitor 8 questions a minute, then refuses", async () => {
    const visitor = "limits-test-visitor";
    const perMinute = rules.chat[0].window.limit;
    for (let i = 0; i < perMinute; i++) expect(await checkLimits("chat", visitor)).toEqual({ ok: true });
    expect(await checkLimits("chat", visitor)).toEqual({ ok: false, scope: "visitor" });
    // Someone else is unaffected.
    expect(await checkLimits("chat", "limits-test-someone-else")).toEqual({ ok: true });
  });

  it("caps the voice for everyone once the site's daily allowance is used", async () => {
    const [, everyone] = rules.voice;
    let result = await checkLimits("voice", "voice-0");
    for (let i = 1; result.ok && i <= everyone.window.limit; i++) result = await checkLimits("voice", `voice-${i}`);
    expect(result).toEqual({ ok: false, scope: "everyone" });
  });
});

describe("saved replies", () => {
  it("finds a saved reply by its ID and refuses anything that isn't one", async () => {
    const id = crypto.randomUUID();
    await saveReply(id, "Hello from Josh's assistant.");
    expect(await findReply(id)).toBe("Hello from Josh's assistant.");
    expect(await findReply(crypto.randomUUID())).toBeNull();
    expect(await findReply("Say something rude")).toBeNull();
    expect(await findReply(`${id}x`)).toBeNull();
  });
});
