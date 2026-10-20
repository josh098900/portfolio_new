import { appWindow, expect, test } from "./fixtures";

const island = (page: import("@playwright/test").Page) => page.getByRole("group", { name: "Dynamic Island" });

test("uses the iPhone shell, and the home indicator goes home", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-shell", "phone");
  await page.getByRole("button", { name: "Go to Home Screen" }).click();
  await expect(page.getByText("Open to graduate roles")).toBeVisible();
  await expect(appWindow(page, "notes")).toHaveAttribute("inert", "");
});

test("Terminal doesn't raise the keyboard by itself", async ({ page }) => {
  // On iPhone, focusing a field on open slid the whole page up behind the keyboard.
  await page.goto("/terminal");
  const command = appWindow(page, "terminal").getByRole("textbox", { name: "Command" });
  await expect(command).toBeVisible();
  await expect(command).not.toBeFocused();
});

test("music carries on in the Dynamic Island, with controls", async ({ page }) => {
  await page.goto("/music");
  const music = appWindow(page, "music");
  await music.getByRole("button", { name: "Songs", exact: true }).click();
  await music.getByRole("button", { name: /^Play .+ by .+$/ }).first().click();
  await expect(music.getByRole("button", { name: "Pause" })).toBeVisible();

  // Nothing in the island while Music is on screen.
  await expect(island(page).getByRole("button")).toHaveCount(0);

  await page.getByRole("button", { name: "Go to Home Screen" }).click();
  const compact = island(page).getByRole("button", { name: /^Now playing: .+ Show controls$/ });
  await expect(compact).toBeVisible();

  await compact.click();
  await island(page).getByRole("button", { name: "Pause" }).click();
  await expect(island(page).getByRole("button", { name: "Play" })).toBeVisible();

  // The artwork opens Music straight into the full-screen player.
  await island(page).getByRole("button", { name: "Open Music" }).click();
  await expect(appWindow(page, "music")).not.toHaveAttribute("inert");
  const player = page.getByRole("dialog", { name: "Now Playing" });
  await expect(player).toBeVisible();
  await expect(player.getByRole("slider", { name: "Position" })).toBeVisible();
  await player.getByRole("button", { name: "Close Now Playing" }).click();
  await expect(player).toHaveCount(0);

  // And the mini player opens it too.
  await music.getByRole("button", { name: /Open full screen$/ }).click();
  await expect(player).toBeVisible();
});

test("a reply that lands while you're elsewhere shows up in the island", async ({ page }) => {
  await page.route("**/api/chat", async route => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    await route.fulfill({ status: 200, headers: { "content-type": "text/plain", "x-reply-id": crypto.randomUUID() }, body: "Josh built Academy Fantasy." });
  });
  await page.goto("/messages");
  const messages = appWindow(page, "messages");
  await messages.getByRole("textbox", { name: "Message Josh's assistant" }).fill("What has Josh built?");
  await messages.getByRole("button", { name: "Send" }).click();
  await page.getByRole("button", { name: "Go to Home Screen" }).click();

  const alert = island(page).getByRole("button", { name: /Josh's Assistant replied/ });
  await expect(alert).toBeVisible();
  await alert.click();
  await expect(messages).not.toHaveAttribute("inert");
  await expect(messages.getByRole("log")).toContainText("Josh built Academy Fantasy.");
});

test("Control Centre flashes the new appearance in the island", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Go to Home Screen" }).click();
  await page.getByRole("button", { name: "Control Centre" }).click();
  const before = await page.locator("html").getAttribute("data-theme");
  await page.getByRole("dialog", { name: "Control Centre" }).getByRole("button", { name: /Dark Mode/ }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", before!);
  await expect(island(page).getByRole("status")).toHaveText(before === "dark" ? "Light Mode, On" : "Dark Mode, On");
});

test("going home clears the app from the address bar, and Back returns to it", async ({ page }) => {
  await page.goto("/activity");
  await page.getByRole("button", { name: "Go to Home Screen" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveTitle("Josh, software engineering student");

  await page.goBack();
  await expect(page).toHaveURL(/\/activity$/);
  await expect(appWindow(page, "activity")).not.toHaveAttribute("inert");

  await page.goForward();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Open to graduate roles")).toBeVisible();
});

test("an app left in the background can't catch taps or scrolls on the home screen", async ({ page }) => {
  // On iPhone, Activity's hidden page was taking the swipes meant for the home screen.
  await page.goto("/activity");
  await page.getByRole("button", { name: "Go to Home Screen" }).click();
  const activity = appWindow(page, "activity");
  await expect(activity).toHaveCSS("visibility", "hidden");
  await expect(activity).toHaveCSS("pointer-events", "none");
  const hit = await page.evaluate(() => {
    const { innerWidth: w, innerHeight: h } = window;
    return document.elementFromPoint(w / 2, h / 2)?.closest("section[aria-labelledby^='window-title-']") ?? null;
  });
  expect(hit).toBeNull();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(appWindow(page, "settings")).not.toHaveAttribute("inert");
});

test("turning the phone sideways on the home screen shows StandBy", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Go to Home Screen" }).click();
  await page.setViewportSize({ width: 852, height: 393 });
  const standby = page.getByRole("dialog", { name: "StandBy" });
  await expect(standby).toBeVisible();
  await standby.getByRole("button", { name: /Close StandBy/ }).click();
  await expect(standby).toHaveCount(0);
});
