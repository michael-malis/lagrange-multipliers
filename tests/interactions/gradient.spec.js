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
  await expect(s.locator('[data-action="next-stage"]')).toBeVisible();
  await expect(s.locator('[data-action="previous-stage"]')).toBeDisabled();
  await expect(s.locator("[data-step-indicator]")).toHaveCount(0);
  await expect(s.locator(".stage-meter")).toHaveAttribute("aria-valuenow", "1");
  await expect(s.locator("[data-current-title]")).toHaveText("Знак производной");
  await expect(s).toHaveAttribute("data-t", "1");
  await s.screenshot({ path: "test-results/proof-initial.png" });
  await s.locator('[data-action="next-stage"]').click();
  await expect(s.locator("[data-vector=gradient]")).toHaveCount(1);
  await expect(s.locator("[data-vector=gradient]")).toHaveAttribute(
    "stroke",
    "#47e1c2",
  );
  await expect(s.locator("[data-vector=projection]")).toHaveCount(0);
  await s.locator('[data-action="next-stage"]').click();
  const plane = s.locator(".plane");
  expect(await plane.getAttribute("data-scale-x")).toBe(
    await plane.getAttribute("data-scale-y"),
  );
  expect(JSON.parse(await plane.getAttribute("data-projection"))).toEqual([
    2, -2,
  ]);
  await expect(plane).toHaveAttribute("data-level", "1");
  expect(+(await plane.getAttribute("data-angle"))).toBeCloseTo(Math.PI / 4, 10);
  await expect(s.locator(".angle-arc")).toBeVisible();
  await expect(s.locator("[data-value=projection-coefficient]")).toBeVisible();
  await s.screenshot({ path: "test-results/proof-positive.png" });
  await s.locator("[data-action=optimum]").click();
  await expect(s.locator('[data-action="optimum"]')).toHaveAttribute("aria-pressed", "true");
  await expect(s.locator("[data-zero-projection]")).toBeVisible();
  await expect(s.locator("[data-tangency]")).toBeVisible();
  await expect(s.locator("[data-value=projection-coefficient]")).toHaveText("0");
  const gf = JSON.parse(await plane.getAttribute("data-gradient"));
  expect(gf[0]).toBeCloseTo(8 / 3, 12);
  expect(gf[1]).toBeCloseTo(8 / 3, 12);
  await s.screenshot({ path: "test-results/proof-zero.png" });
  await s.locator("[data-action=after]").click();
  expect(JSON.parse(await plane.getAttribute("data-projection"))).toEqual([
    -1, 1,
  ]);
  await s.screenshot({ path: "test-results/proof-negative.png" });
  await s.locator('[data-action="next-stage"]').click();
  await expect(s.locator("[data-vector=normal]")).toBeVisible();
  await expect(s.locator(".stage-meter")).toHaveAttribute("aria-valuenow", "4");
  await expect(s.locator('[data-action="next-stage"]')).toBeHidden();
  await expect(s.locator("[data-complete]")).toBeVisible();
  await expect(s.locator(".proof-status")).toContainText("не удовлетворяет");
  await expect(s.locator(".vector-key")).toContainText("градиент");
  await expect(s.locator("[data-current-title]")).toHaveText("Условие Лагранжа");
  await s.locator('[data-action="previous-stage"]').click();
  await expect(s).toHaveAttribute("data-step", "2");
  await s.locator('[data-action="next-stage"]').click();
  await expect(s.locator(".plane .vector-label")).toHaveCount(1);
  await s.locator("[data-action=optimum]").click();
  await expect(s.locator(".proof-status")).toContainText("λ = 8/3");
  await s.screenshot({ path: "test-results/proof-normal.png" });
  const first = page.locator("#scene-one");
  await first.getByRole("button", { name: "Точно в максимум" }).click();
  await expect(s).toHaveAttribute("data-t", String(5 / 3));
  await s.locator("[data-action=reset]").click();
  await expect(s).toHaveAttribute("data-t", "1");
  await expect(s).toHaveAttribute("data-step", "0");
  await expect(first).toHaveAttribute("data-t", String(5 / 3));
});
