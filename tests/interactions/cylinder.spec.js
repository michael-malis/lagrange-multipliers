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
  await s.screenshot({ path: "test-results/cylinder-local.png" });
  await s.getByRole("button", { name: "Глобальный максимум · 2" }).click();
  await expect(s).toHaveAttribute("data-height", "2");
  await s.getByRole("button", { name: "Показать кандидатов" }).click();
  await expect(s.locator(".profile .candidate")).toHaveCount(4);
  const position = JSON.parse(
    await s.locator(".world").getAttribute("data-position"),
  );
  expect(position).toEqual([1, 0, 2]);
  await s.screenshot({ path: "test-results/cylinder-global.png" });
  await s.locator("summary").click();
  await s.getByRole("button", { name: "Минимум · y > 0" }).click();
  await expect(s.locator("[data-value=lambda]")).toHaveText("-1");
  const circle = s.locator(".circle-plot");
  const gf = JSON.parse(await circle.getAttribute("data-gradient")),
    gg = JSON.parse(await circle.getAttribute("data-normal"));
  expect(gf[0] * gg[0] + gf[1] * gg[1]).toBeLessThan(0);
  expect(+(await s.getAttribute("data-height"))).toBeCloseTo(-9 / 8, 12);
  await s.screenshot({ path: "test-results/cylinder-minimum.png" });
  await s.getByRole("button", { name: "Контрпример: f = y³" }).click();
  await expect(s).toHaveAttribute("data-model", "counterexample");
  await expect(s.locator("[data-value=lambda]")).toHaveText("0");
  await expect(circle.locator("[data-vector=gf]")).toHaveCount(0);
  await expect(s.locator(".proof-status")).toContainText("без экстремума");
  await s.screenshot({ path: "test-results/cylinder-counterexample.png" });
  const box = await circle.boundingBox();
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(center.x + box.width * 0.2, center.y + 3);
  await page.mouse.down();
  expect(+(await s.getAttribute("data-t"))).toBeGreaterThan(6);
  expect(+(await s.getAttribute("data-height"))).toBeLessThan(0);
  await page.mouse.move(center.x + box.width * 0.2, center.y - 3);
  await page.mouse.up();
  expect(+(await s.getAttribute("data-t"))).toBeLessThan(0.1);
  expect(+(await s.getAttribute("data-height"))).toBeGreaterThan(0);
  await s.getByRole("button", { name: "Сбросить сцену" }).click();
  await expect(s).toHaveAttribute("data-model", "cylinder");
  await expect(s).toHaveAttribute("data-t", String(Math.PI));
  await expect(s.locator("details")).not.toHaveAttribute("open");
  expect(errors).toEqual([]);
});
