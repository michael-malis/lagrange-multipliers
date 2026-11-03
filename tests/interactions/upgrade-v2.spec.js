import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const pageUrl = pathToFileURL(resolve("dist/index.html")).href;

test("v2: shared parameter across 3D and level sets, independent proof stage", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  const surface = page.locator("#scene-one");
  const proof = page.locator("#scene-two");
  await surface.locator("[data-action=optimum]").click();
  await expect(proof).toHaveAttribute("data-t", String(5 / 3));
  await proof.locator("[data-action=next-stage]").click();
  await expect(proof).toHaveAttribute("data-step", "1");
  await surface.locator("[data-action=plane]").click();
  await expect(proof).toHaveAttribute("data-step", "1");
  await proof.locator("[data-action=after]").click();
  await expect(surface).toHaveAttribute("data-t", "2");
  await expect(surface.locator("[data-value=height]")).toHaveText("2");
  await proof.locator("[data-action=reset]").click();
  await expect(surface).toHaveAttribute("data-t", "1");
});

test("v2: reading and demonstration reuse the same scenes and preserve state", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  const surface = page.locator("#scene-one");
  await surface.locator("[data-action=optimum]").click();
  await page.getByRole("button", { name: "Переключить режим чтения и демонстрации" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-mode", "demo");
  await expect(surface).toHaveAttribute("data-t", String(5 / 3));
  await page.locator("[data-demo-next]").click();
  await expect(page.locator("#geometry")).toHaveAttribute("data-demo-active", "true");
  await expect(page.locator("#scene-two")).toHaveAttribute("data-t", String(5 / 3));
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#scene-two")).toHaveAttribute("data-step", "1");
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).toHaveAttribute("data-mode", "read");
  await expect(page.locator("#scene-two")).toHaveAttribute("data-step", "1");
  await expect(page.locator("#geometry")).toBeVisible();
});

test("v2: no quiz blocks, enlarged non-extremum and vertical fractions", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  await expect(page.locator(".understanding-check")).toHaveCount(0);
  await expect(page.getByText("Проверка понимания")).toHaveCount(0);
  const scene = page.locator("#scene-three");
  await scene.locator('[data-action="switch-model"]').click();
  await expect(scene.locator(".counterexample-inset")).toBeVisible();
  await expect(scene.locator(".counterexample-inset figcaption")).toContainText("не экстремум");
  await expect(scene.locator("[data-value=lambda]")).toHaveText("1");
  await expect(scene.locator(".circle-plot")).toHaveAttribute("data-gradient", "[2,0]");
  await expect(page.locator(".katex-error")).toHaveCount(0);
  await expect(page.locator("#calculation .katex mfrac").first()).toBeAttached();
});

test("v2: demonstration geometry, formula and controls fit a Full HD viewport", async ({ page, context }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await context.setOffline(true);
  await page.goto(pageUrl);
  await page.getByRole("button", { name: "Переключить режим чтения и демонстрации" }).click();
  const measure = async () => page.evaluate(() => {
    const toolbar = document.querySelector(".demo-toolbar").getBoundingClientRect();
    const scene = document.querySelector('[data-demo-active="true"] .scene').getBoundingClientRect();
    const view = document.querySelector('[data-demo-active="true"] .scene-layout').getBoundingClientRect();
    return { sceneTop: scene.top, sceneBottom: scene.bottom, toolbarBottom: toolbar.bottom, viewBottom: view.bottom, viewport: innerHeight };
  });
  for (let i = 0; i < 3; i++) {
    await page.screenshot({ path: `test-results/v2-demo-fullhd-${i + 1}.png` });
    const bounds = await measure();
    expect(bounds.sceneTop, JSON.stringify(bounds)).toBeGreaterThanOrEqual(-1);
    expect(bounds.viewBottom, JSON.stringify(bounds)).toBeLessThanOrEqual(1080);
    if (i < 2) await page.locator("[data-demo-next]").click();
  }
});

test("v2: mobile and 200 percent zoom reflow keeps control buttons within viewport", async ({ page, context }) => {
  await context.setOffline(true);
  for (const width of [390, 640]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(pageUrl);
    await page.getByRole("button", { name: "Переключить режим чтения и демонстрации" }).click();
    await page.screenshot({ path: `test-results/v2-demo-reflow-${width}.png` });
    const overflowing = await page.evaluate(() => [...document.querySelectorAll('body[data-mode="demo"] button')].filter(el => {
      const box = el.getBoundingClientRect();
      return getComputedStyle(el).display !== "none" && box.width && (box.left < -1 || box.right > innerWidth + 1);
    }).map(el => el.textContent.trim()));
    expect(overflowing).toEqual([]);
  }
});

test("v2: laptop demonstration shows geometry and profile without vertical jumps", async ({ page, context }) => {
  await context.setOffline(true);
  for (const [width, height] of [[1440, 900], [1280, 800]]) {
    await page.setViewportSize({ width, height });
    await page.goto(pageUrl);
    await page.getByRole("button", { name: "Переключить режим чтения и демонстрации" }).click();
    for (let i = 0; i < 3; i++) {
      const active = page.locator('[data-demo-active="true"] .scene');
      await expect(active.locator(".scene-layout")).toBeVisible();
      await expect(active.locator("[data-profile] svg")).toBeVisible();
      const metrics = await active.locator(".scene-layout").evaluate(node => {
        const rect = node.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: innerHeight, width: document.documentElement.scrollWidth };
      });
      expect(metrics.bottom, JSON.stringify(metrics)).toBeLessThanOrEqual(height + 1);
      expect(metrics.width, JSON.stringify(metrics)).toBeLessThanOrEqual(width);
      await page.screenshot({ path: `test-results/v2-demo-${width}x${height}-chapter-${i+1}.png` });
      if (i < 2) await page.locator("[data-demo-next]").click();
    }
  }
});

test("v2: narrow-screen geometry/profile toggle preserves shared t and circle model", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await context.setOffline(true);
  await page.goto(pageUrl);
  const surface = page.locator("#scene-one");
  const gradient = page.locator("#scene-two");
  await surface.locator("[data-action=optimum]").click();
  const toggle = surface.locator(".mobile-view-toggle");
  await expect(toggle).toBeVisible();
  await expect(surface.locator(".profile-panel")).toBeHidden();
  await toggle.getByRole("button", { name: "Профиль высоты" }).click();
  await expect(surface.locator(".profile-panel")).toBeVisible();
  await expect(surface.locator(".world")).toBeHidden();
  await expect(surface).toHaveAttribute("data-t", String(5 / 3));
  await expect(gradient).toHaveAttribute("data-t", String(5 / 3));
  await gradient.locator(".mobile-view-toggle").getByRole("button", { name: "Профиль высоты" }).click();
  await expect(gradient.locator(".proof-side")).toBeVisible();
  await expect(gradient.locator(".plane-column")).toBeHidden();
  await gradient.locator(".mobile-view-toggle").getByRole("button", { name: "Геометрия" }).click();
  await expect(gradient.locator(".plane-column")).toBeVisible();
  const circle = page.locator("#scene-three");
  await circle.locator('[data-action="switch-model"]').click();
  await circle.locator(".mobile-view-toggle").getByRole("button", { name: "Профиль высоты" }).click();
  await expect(circle.locator("[data-profile] svg")).toBeVisible();
  await expect(circle.locator("[data-value=lambda]")).toHaveText("1");
  await expect(page.locator(".katex-error")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
