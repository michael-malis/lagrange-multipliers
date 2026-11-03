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

test("v2: optional checks, enlarged non-extremum and vertical fractions", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  await expect(page.locator(".understanding-check")).toHaveCount(2);
  const first = page.locator(".understanding-check").first();
  await first.getByRole("button", { name: "Нет" }).click();
  await expect(first.locator(".understanding-feedback")).toContainText("Верно");
  const scene = page.locator("#scene-three");
  await scene.locator('[data-action="switch-model"]').click();
  await expect(scene.locator(".counterexample-inset")).toBeVisible();
  await expect(scene.locator(".counterexample-inset figcaption")).toContainText("не экстремум");
  await expect(scene.locator("[data-value=lambda]")).toHaveText("1");
  await expect(scene.locator(".circle-plot")).toHaveAttribute("data-gradient", "[2,0]");
  await expect(page.locator(".katex-error")).toHaveCount(0);
  await expect(page.locator("#calculation .katex mfrac").first()).toBeAttached();
});
