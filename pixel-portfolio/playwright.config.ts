import { defineConfig, devices } from "@playwright/test";

// Browser tests run against a production build (`npm run build` first) on its
// own port. The API keys and Redis settings are blanked for the test server,
// so a test run can never spend Anthropic or ElevenLabs credit or touch the
// live rate limits, even on a machine with a filled-in .env.local.

const port = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mac", testMatch: /(desktop|a11y)\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    // Safari's engine at iPhone size, plus Chrome at Android phone size.
    { name: "iphone", testMatch: /phone\.spec\.ts/, use: { ...devices["iPhone 15"] } },
    { name: "android", testMatch: /phone\.spec\.ts/, use: { ...devices["Pixel 7"] } },
    { name: "api", testMatch: /api\.spec\.ts/ },
  ],
  webServer: {
    command: `npx next start --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      ANTHROPIC_API_KEY: "",
      ELEVENLABS_API_KEY: "",
      KV_REST_API_URL: "",
      KV_REST_API_TOKEN: "",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
    },
  },
});
