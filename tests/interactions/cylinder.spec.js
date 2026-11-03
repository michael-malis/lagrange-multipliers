import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
test("cylinder: distinct maxima, all candidates, negative multiplier, zero gradient and seam", async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(pathToFileURL(resolve("dist/index.html")).href);
  const s = page.locator("#scene-three");
  await s.scrollIntoViewIfNeeded();
  expect(+(await s.getAttribute("data-height"))).toBeCloseTo(0, 12);
  await expect(s.locator("[data-value=height]")).toHaveText("0");
  await expect(s.locator(".world")).toHaveAttribute("data-webgl", "ready");
  await expect(s.locator('[data-action="switch-model"]')).toHaveCount(1);
  await expect(s.locator(".study-point-group button")).toHaveCount(2);
  await expect(s.locator("[data-action=minimum-plus]")).toHaveText("Минимум · y > 0");
  await s.screenshot({ path: "test-results/cylinder-local.png" });
  await s.getByRole("button", { name: "Глобальный максимум · 2" }).click();
  await expect(s).toHaveAttribute("data-height", "2");
  await s.getByRole("button", { name: "Стационарные точки", exact: true }).click();
  await expect(s.locator(".profile .candidate")).toHaveCount(4);
  const position = JSON.parse(
    await s.locator(".world").getAttribute("data-position"),
  );
  expect(position).toEqual([1, 0, 2]);
  await s.screenshot({ path: "test-results/cylinder-global.png" });
  await s.getByRole("button", { name: "Минимум · y > 0" }).click();
  await expect(s.locator("[data-value=lambda]")).toHaveText("-1");
  const circle = s.locator(".circle-plot");
  const gf = JSON.parse(await circle.getAttribute("data-gradient")),
    gg = JSON.parse(await circle.getAttribute("data-normal"));
  expect(gf[0] * gg[0] + gf[1] * gg[1]).toBeLessThan(0);
  expect(+(await s.getAttribute("data-height"))).toBeCloseTo(-9 / 8, 12);
  await s.screenshot({ path: "test-results/cylinder-minimum.png" });
  await s.locator('[data-action="switch-model"]').click();
  await expect(s).toHaveAttribute("data-model", "counterexample");
  await expect(s.locator("[data-model-context]")).toContainText("Дополнительный пример");
  await expect(s.locator('[data-action="switch-model"]')).toHaveAttribute("aria-pressed", "true");
  await expect(s.locator('[data-action="switch-model"]')).toHaveText("Вернуться к исходной функции");
  await expect(s.locator("[data-action=minimum-plus]")).toHaveText("Стационарная точка · t = 0");
  await expect(s.locator("[data-action=minimum-minus]")).toHaveText("Максимум · y = 1");
  await s.locator("[data-action=minimum-minus]").click();
  await expect(s.locator("[data-value=height]")).toHaveText("1");
  await s.locator("[data-action=minimum-plus]").click();
  await expect(s.locator("[data-value=lambda]")).toHaveText("0");
  await expect(circle.locator("[data-vector=gf]")).toHaveCount(0);
  await expect(s.locator(".proof-status")).toContainText("без экстремума");
  await s.screenshot({ path: "test-results/cylinder-counterexample.png" });
  // Use the SVG coordinate system, not the CSS bounding-box center:
  // responsive layouts may add padding or alter the rendered aspect ratio.
  const seam = await circle.evaluate((svg) => {
    const matrix = svg.getScreenCTM();
    const screen = (x, y) => {
      const point = new DOMPoint(x, y).matrixTransform(matrix);
      return { x: point.x, y: point.y };
    };
    return { below: screen(170, 150), above: screen(170, 110) };
  });
  await page.mouse.move(seam.below.x, seam.below.y);
  await page.mouse.down();
  expect(+(await s.getAttribute("data-t"))).toBeGreaterThan(5.5);
  expect(+(await s.getAttribute("data-height"))).toBeLessThan(0);
  await page.mouse.move(seam.above.x, seam.above.y, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => +(await s.getAttribute("data-t"))).toBeLessThan(0.7);
  expect(+(await s.getAttribute("data-height"))).toBeGreaterThan(0);
  await s.locator('[data-action="switch-model"]').click();
  await expect(s).toHaveAttribute("data-model", "cylinder");
  await s.locator("[data-action=reset]").click();
  await expect(s).toHaveAttribute("data-model", "cylinder");
  await expect(s.locator("[data-action=minimum-plus]")).toHaveText("Минимум · y > 0");
  await expect(s.locator("[data-action=minimum-minus]")).toHaveText("Минимум · y < 0");
  await expect(s).toHaveAttribute("data-t", String(Math.PI));
  await expect(s.locator("details")).toHaveCount(0);
  await expect(s.locator(".cylinder-study")).toBeVisible();
  expect(errors).toEqual([]);
});
