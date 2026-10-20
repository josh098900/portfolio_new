import { appWindow, expect, test } from "./fixtures";

test("opens on the About note and says what Josh is looking for", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Josh/);
  const notes = appWindow(page, "notes");
  await expect(notes.getByRole("heading", { level: 1, name: /Hi, I'm Josh/ })).toBeVisible();
  await expect(notes.getByText(/looking for graduate software engineering roles/)).toBeVisible();
});

test("opens a case study from the dock, and the back button returns", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Dock" }).getByRole("button", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);

  const projects = appWindow(page, "projects");
  await projects.getByRole("button", { name: "Academy Fantasy", exact: true }).click();
  await projects.getByRole("button", { name: "Read the case study" }).click();
  await expect(page).toHaveURL(/\/projects\/academy-fantasy$/);
  await expect(projects.getByRole("heading", { level: 1, name: "Academy Fantasy" })).toBeVisible();
  await expect(page).toHaveTitle(/Academy Fantasy/);

  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
});

test("traffic lights minimise, restore and close windows", async ({ page }) => {
  await page.goto("/");
  const notes = appWindow(page, "notes");
  await notes.getByRole("button", { name: "Minimise Notes" }).click();
  await expect(notes).toHaveAttribute("inert", "");

  await page.getByRole("navigation", { name: "Dock" }).getByRole("button", { name: "Notes (open)" }).click();
  await expect(notes).not.toHaveAttribute("inert");

  await notes.getByRole("button", { name: "Close Notes" }).click();
  await expect(notes).toHaveCount(0);
});

test("Spotlight finds and opens Terminal, which answers commands", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("ControlOrMeta+k");
  const search = page.getByRole("combobox", { name: "Spotlight search" }).or(page.getByRole("textbox", { name: "Spotlight search" }));
  await search.fill("terminal");
  await search.press("Enter");

  const terminal = appWindow(page, "terminal");
  const command = terminal.getByRole("textbox", { name: "Command" });
  await expect(command).toBeFocused();
  await command.fill("whoami");
  await command.press("Enter");
  await expect(terminal.getByRole("log", { name: "Terminal output" })).toContainText("graduate software engineering roles");
  await expect(page).toHaveURL(/\/terminal$/);
});

test("Contacts shows only LinkedIn and GitHub, plus the job search", async ({ page }) => {
  await page.goto("/contact");
  const contact = appWindow(page, "contact");
  await expect(contact.getByText("Looking for graduate software engineering roles")).toBeVisible();
  const external = await contact.locator("a[href^='http']").evaluateAll(links => [...new Set(links.map(a => new URL((a as HTMLAnchorElement).href).host))]);
  expect(external.sort()).toEqual(["github.com", "www.linkedin.com"]);
  await expect(contact.locator("a[href^='mailto:'], a[href^='tel:']")).toHaveCount(0);
});

test("the wallpaper choice survives a reload", async ({ page }) => {
  await page.goto("/settings/wallpaper");
  await appWindow(page, "settings").getByRole("group", { name: "Wallpapers" }).getByRole("button", { name: "Dune" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "dune");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "dune");
});

test("Messages shows the assistant's reply, with links only to safe places", async ({ page }) => {
  await page.route("**/api/chat", route => route.fulfill({
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8", "x-reply-id": crypto.randomUUID() },
    body: "Josh is looking for graduate software engineering roles. [Get in touch](/contact), or try [this](https://evil.example).",
  }));
  await page.goto("/messages");
  const messages = appWindow(page, "messages");
  await messages.getByRole("textbox", { name: "Message Josh's assistant" }).fill("Is Josh looking for work?");
  await messages.getByRole("button", { name: "Send" }).click();

  const log = messages.getByRole("log");
  await expect(log).toContainText("Is Josh looking for work?");
  await expect(log).toContainText("looking for graduate software engineering roles");
  await expect(log.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", "/contact");
  await expect(log.getByRole("link", { name: "this" })).toHaveCount(0);
  await expect(log.getByRole("button", { name: "Listen" })).toBeVisible();

  await log.getByRole("link", { name: "Get in touch" }).click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("unknown pages get a 404", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-page");
  expect(response?.status()).toBe(404);
});

test("TV shows Josh's latest film, review and diary", async ({ page }) => {
  await page.goto("/tv");
  const tv = appWindow(page, "tv");
  const hero = tv.getByRole("region", { name: "Featured films", exact: true });
  await expect(hero.getByRole("heading", { name: "Tenzing" })).toBeVisible();
  await expect(hero.getByText("A true masterpiece!")).toBeVisible();
  await expect(hero.getByRole("img", { name: "Rated 5 out of 5" })).toBeVisible();
  await expect(tv.getByRole("region", { name: "In Josh's words" })).toContainText("That's all I have to say.");

  await tv.getByRole("navigation").getByRole("button", { name: "Diary" }).click();
  await expect(tv.getByRole("link", { name: /F1/ })).toHaveAttribute("href", "https://letterboxd.com/josh098900/film/f1/");
  await expect(tv.getByRole("img", { name: "Rewatch" })).toBeVisible();
});

test("minimising pours the window into the dock with the genie effect", async ({ page }) => {
  await page.goto("/");
  const notes = appWindow(page, "notes");
  await notes.getByRole("button", { name: "Minimise Notes" }).click();
  const genie = await notes.evaluate(el => el.getAnimations().some(a => (a.effect as KeyframeEffect).getKeyframes().some(k => String(k.clipPath).startsWith("polygon"))));
  expect(genie).toBe(true);
  await expect(notes).toHaveAttribute("inert", "");
  await page.getByRole("navigation", { name: "Dock" }).getByRole("button", { name: "Notes (open)" }).click();
  await expect(notes).not.toHaveAttribute("inert");
  await expect(notes.getByRole("heading", { level: 1, name: /Hi, I'm Josh/ })).toBeVisible();
});

test("the screen saver writes hello, and any key wakes the desktop", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Portfolio" }).click();
  await page.getByRole("menuitem", { name: "Start Screen Saver" }).click();
  const saver = page.locator("svg path[pathLength]").first();
  await expect(saver).toBeVisible();
  await page.waitForTimeout(700);
  await page.keyboard.press("Space");
  await expect(saver).toHaveCount(0);
});

test("the assistant's glow shows while it thinks", async ({ page }) => {
  let release!: () => void;
  const replied = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/chat", async route => {
    await replied;
    await route.fulfill({ status: 200, headers: { "content-type": "text/plain", "x-reply-id": crypto.randomUUID() }, body: "Josh built Academy Fantasy." });
  });
  await page.goto("/messages");
  const messages = appWindow(page, "messages");
  await messages.getByRole("textbox", { name: "Message Josh's assistant" }).fill("What has Josh built?");
  await messages.getByRole("button", { name: "Send" }).click();
  const glow = page.locator("[data-state='thinking']");
  await expect(glow).toHaveCount(1);
  release();
  await expect(messages.getByRole("log")).toContainText("Josh built Academy Fantasy.");
  await expect(glow).toHaveCount(0);
});

test("the London Sky wallpaper is painted before the page loads", async ({ page }) => {
  await page.goto("/settings/wallpaper");
  await appWindow(page, "settings").getByRole("group", { name: "Wallpapers" }).getByRole("button", { name: "London Sky" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "london");
  // Block the app's JavaScript: the sky must come from the inline pre-paint script alone.
  await page.route(/\/_next\/static\/.*\.js$/, route => route.abort());
  await page.reload();
  const sky = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--sky-top"));
  expect(sky).toMatch(/^rgb\(\d+ \d+ \d+\)$/);
});

test("windows tile from the Window menu and by dragging to an edge", async ({ page }) => {
  await page.goto("/");
  const notes = appWindow(page, "notes");
  await page.getByRole("button", { name: "Window" }).click();
  await page.getByRole("menuitem", { name: "Tile Left" }).click();
  await expect.poll(async () => (await notes.boundingBox())?.x).toBeLessThan(20);
  const box = (await notes.boundingBox())!;
  expect(box.width).toBeGreaterThan(600);
  expect(box.width).toBeLessThan(760);

  // Drag by the toolbar to the right edge: a preview shows, and the window lands on the right half.
  const viewport = page.viewportSize()!;
  await page.mouse.move(box.x + 300, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(viewport.width - 2, box.y + 300, { steps: 12 });
  await expect(page.locator("[class*=snapPreview]")).toHaveCount(1);
  await page.mouse.up();
  await expect.poll(async () => (await notes.boundingBox())!.x).toBeGreaterThan(viewport.width / 2 - 20);
});

test("the top-left hot corner opens Mission Control, and picking a window brings it forward", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Dock" }).getByRole("button", { name: "Projects", exact: true }).click();
  await page.mouse.move(200, 200);
  await page.mouse.move(1, 1, { steps: 5 });
  const mission = page.getByRole("dialog", { name: "Mission Control" });
  await expect(mission).toBeVisible();
  await mission.getByRole("button", { name: "Notes" }).click();
  await expect(mission).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
});

test("the App Store lists Josh's projects, and Get turns into Open", async ({ page }) => {
  await page.goto("/appstore");
  const store = appWindow(page, "appstore");
  await store.getByRole("button", { name: /^Lab Hangout:/ }).click();
  await expect(store.getByRole("heading", { level: 1, name: "Lab Hangout" })).toBeVisible();
  await store.getByRole("button", { name: "Get Lab Hangout" }).click();
  await expect(store.getByRole("link", { name: "Open Lab Hangout" })).toHaveAttribute("href", "https://lab-hangout.vercel.app/");
});

test("AirDrop downloads the CV as a one-page PDF", async ({ page }) => {
  await page.goto("/resume");
  await appWindow(page, "resume").getByRole("button", { name: "AirDrop the CV as a PDF" }).click();
  const sheet = page.getByRole("dialog", { name: "AirDrop" });
  const download = page.waitForEvent("download");
  await sheet.getByRole("button", { name: /^Send the CV to your Mac/ }).click();
  expect((await download).suggestedFilename()).toBe("Joshua-Mathers-CV.pdf");
  await expect(sheet.getByRole("status")).toHaveText("Delivered");
});

test("achievements are announced, and listed in Arcade", async ({ page }) => {
  await page.goto("/resume");
  await expect(page.getByRole("button", { name: /Achievement unlocked.*Hiring Manager/ })).toBeVisible();
  await page.goto("/arcade");
  const trophies = appWindow(page, "arcade").getByRole("region", { name: /Achievements/ });
  await expect(trophies).toContainText("1 of");
  await expect(trophies.getByText("Hiring Manager")).toBeVisible();
});

test("Terminal can make it rain and snow, and clear brings back London's weather", async ({ page }) => {
  await page.goto("/terminal");
  const command = appWindow(page, "terminal").getByRole("textbox", { name: "Command" });
  await command.fill("snow");
  await command.press("Enter");
  await expect(page.locator("canvas[data-weather='snow']")).toHaveCount(1);
  await command.fill("clear");
  await command.press("Enter");
  await expect(page.locator("canvas[data-weather='snow']")).toHaveCount(0);
});

test("visionOS mode floats the windows, and turns off again", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Control Centre" }).click();
  await page.getByRole("dialog", { name: "Control Centre" }).getByRole("button", { name: /^visionOS/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-spatial", "");
  await page.getByRole("button", { name: "Control Centre" }).click();
  await page.getByRole("dialog", { name: "Control Centre" }).getByRole("button", { name: /^visionOS/ }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-spatial");
});

test("the glass magnifier follows the pointer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Help" }).click();
  await page.getByRole("menuitem", { name: /Glass Magnifier/ }).click();
  await page.mouse.move(800, 400);
  await expect(page.locator("[class*=_lens]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("[class*=_lens]")).toHaveCount(0);
});

test("the dock critter can be petted", async ({ page }) => {
  await page.goto("/");
  const critter = page.getByRole("button", { name: /Lab critter/ });
  await critter.click();
  await expect(critter).toHaveAttribute("data-mood", "happy");
});
