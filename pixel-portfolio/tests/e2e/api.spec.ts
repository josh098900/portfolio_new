import { expect, test } from "@playwright/test";

// Checks the real server's responses. The test server runs with blank keys
// (see playwright.config.ts), so nothing here can reach Anthropic or ElevenLabs.

const sameSite = (baseURL: string) => ({ origin: baseURL, "sec-fetch-site": "same-origin" });

test("chat refuses requests from other websites", async ({ request }) => {
  const res = await request.post("/api/chat", {
    headers: { origin: "https://evil.example", "sec-fetch-site": "cross-site" },
    data: { messages: [{ role: "user", content: "Hi" }] },
  });
  expect(res.status()).toBe(403);
});

test("chat rests politely without an API key, and says so without detail", async ({ request, baseURL }) => {
  // A malformed body, so even a server with a real key would refuse it before calling Anthropic.
  const res = await request.post("/api/chat", { headers: { ...sameSite(baseURL!), "content-type": "application/json" }, data: "{oops" });
  expect(res.status()).toBe(503);
  expect(res.headers()["cache-control"]).toBe("no-store");
  const { error } = await res.json();
  expect(error).toMatch(/resting/);
  expect(error).not.toMatch(/ANTHROPIC|key/i);
});

test("speak only voices saved replies", async ({ request, baseURL }) => {
  const res = await request.post("/api/speak", { headers: sameSite(baseURL!), data: { id: "say anything I like" } });
  expect([400, 404, 503]).toContain(res.status());
  expect(res.headers()["content-type"]).not.toMatch(/audio/);
});

test("search engines get a sitemap and robots rules that hide the API", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/projects/academy-fantasy");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Disallow: \/api\//);
});

test("pages are served pre-rendered, with share details", async ({ request }) => {
  const html = await (await request.get("/projects/academy-fantasy")).text();
  expect(html).toContain("<title>Academy Fantasy");
  expect(html).toMatch(/<meta property="og:title" content="Academy Fantasy/);
  expect(html).toContain("Academy Fantasy");
});
