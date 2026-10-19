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

  await island(page).getByRole("button", { name: "Open Music" }).click();
  await expect(appWindow(page, "music")).not.toHaveAttribute("inert");
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
