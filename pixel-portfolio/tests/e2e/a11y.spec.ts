import AxeBuilder from "@axe-core/playwright";
import { readyApps } from "@/os/routes";
import { expect, test } from "./fixtures";

// Automated accessibility checks (WCAG 2.2 AA rules) on every app, in light and
// dark mode. They catch a good share of problems, though not all of them.

const paths = ["/", ...readyApps.filter(app => app !== "notes").map(app => `/${app}`), "/projects/academy-fantasy"];

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    for (const path of paths) {
      test(`${path} has no accessibility violations`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        // Let windows finish opening, so text isn't measured mid-fade.
        await page.waitForTimeout(800);
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(violations.map(v => `${v.id}: ${v.help} (${v.nodes.length}× e.g. ${v.nodes[0]?.target.join(" ")})`)).toEqual([]);
      });
    }
  });
}
