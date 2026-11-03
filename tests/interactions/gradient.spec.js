import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
test("proof: staged causal chain, sign, projection, equal axes and reset", async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  await page.goto(pathToFileURL(resolve("dist/index.html")).href);
  const s = page.locator("#scene-two");
  await s.scrollIntoViewIfNeeded();
  await expect(s.locator("[data-vector]")).toHaveCount(0);
  await expect(s).toHaveAttribute("data-t", "1");
  await s.screenshot({ path: "test-results/proof-initial.png" });
  await s.getByRole("button", { name: "Следующий шаг" }).click();
  await expect(s.locator("[data-vector=gradient]")).toHaveCount(1);
  await expect(s.locator("[data-vector=gradient]")).toHaveAttribute(
    "stroke",
    "#77bdb5",
  );
  await expect(s.locator("[data-vector=projection]")).toHaveCount(0);
  await s.getByRole("button", { name: "Следующий шаг" }).click();
  const plane = s.locator(".plane");
  expect(await plane.getAttribute("data-scale-x")).toBe(
    await plane.getAttribute("data-scale-y"),
  );
  expect(JSON.parse(await plane.getAttribute("data-projection"))).toEqual([
    2, -2,
  ]);
  await expect(s.locator("[data-value=projection]")).toBeVisible();
  await s.screenshot({ path: "test-results/proof-positive.png" });
  await s.getByRole("button", { name: "Точно: t = 5/3" }).click();
  await expect(s.locator("[data-zero-projection]")).toBeVisible();
  await expect(s.locator("[data-value=projection]")).toHaveText("0");
  const gf = JSON.parse(await plane.getAttribute("data-gradient"));
  expect(gf[0]).toBeCloseTo(8 / 3, 12);
  expect(gf[1]).toBeCloseTo(8 / 3, 12);
  await s.screenshot({ path: "test-results/proof-zero.png" });
  await s.getByRole("button", { name: "После: t = 2" }).click();
  expect(JSON.parse(await plane.getAttribute("data-projection"))).toEqual([
    -1, 1,
  ]);
  await s.screenshot({ path: "test-results/proof-negative.png" });
  await s.getByRole("button", { name: "Следующий шаг" }).click();
  await expect(s.locator("[data-vector=normal]")).toBeVisible();
  await s.getByRole("button", { name: "Следующий шаг" }).click();
  await expect(s.locator(".proof-status")).toContainText("не выполнено");
  await s.getByRole("button", { name: "Точно: t = 5/3" }).click();
  await expect(s.locator(".proof-status")).toContainText("λ = 8/3");
  await s.screenshot({ path: "test-results/proof-normal.png" });
  const first = page.locator("#scene-one");
  await first.getByRole("button", { name: "Точно в максимум" }).click();
  await expect(s).toHaveAttribute("data-t", String(5 / 3));
  await s.getByRole("button", { name: "Сбросить сцену" }).click();
  await expect(s).toHaveAttribute("data-t", "1");
  await expect(s).toHaveAttribute("data-step", "0");
  await expect(first).toHaveAttribute("data-t", String(5 / 3));
});
