import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
for (const [width, height] of [
  [1440, 900],
  [1280, 800],
  [390, 844],
])
  test(`article layout ${width}x${height}`, async ({ page, context }) => {
    await page.setViewportSize({ width, height });
    await context.setOffline(true);
    await page.goto(pathToFileURL(resolve("dist/index.html")).href);
    await expect(page.locator("[data-scene]")).toHaveCount(3);
    await expect(page.locator("details[open]")).toHaveCount(0);
    await expect(page.locator(".katex-error")).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/article-${width}.png` });
    for (const id of ["scene-one", "scene-two", "scene-three"]) {
      const scene = page.locator("#" + id);
      await scene.scrollIntoViewIfNeeded();
      await scene.screenshot({ path: `test-results/${id}-${width}.png` });
      const buttons = scene.getByRole("button");
      for (let i = 0; i < (await buttons.count()); i++) {
        const b = buttons.nth(i);
        if (await b.isVisible()) {
          const box = await b.boundingBox();
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        }
      }
    }
    await page.locator("#extras details").first().locator("summary").click();
    await page.locator("#extras details").nth(3).locator("summary").click();
    await expect(page.locator(".katex-error")).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
