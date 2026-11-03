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

test("second figure: zoom, pan and drag its mathematical point independently", async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(pathToFileURL(resolve("dist/index.html")).href);
  const scene = page.locator("#scene-two"),
    svg = scene.locator("svg.plane");
  await svg.scrollIntoViewIfNeeded();
  await expect(svg).toHaveAttribute("data-zoom", "1");
  const initialT = await scene.getAttribute("data-t");
  const initialBox = await svg.getAttribute("viewBox");
  await scene.locator('[data-action="zoom-in"]').click();
  expect(+(await svg.getAttribute("data-zoom"))).toBeGreaterThan(1);
  await expect(scene).toHaveAttribute("data-t", initialT);
  await scene.locator('[data-action="zoom-out"]').click();
  expect(+(await svg.getAttribute("data-zoom"))).toBeCloseTo(1, 2);
  await scene.locator('[data-action="zoom-in"]').click();
  await scene.locator('[data-action="reset-view"]').click();
  await expect(svg).toHaveAttribute("viewBox", initialBox);

  // Drag on background => pan camera, not the mathematical point.
  const position = await svg.evaluate((node) => {
    const matrix = node.getScreenCTM();
    const screen = (x, y) => {
      const p = new DOMPoint(x, y).matrixTransform(matrix);
      return { x: p.x, y: p.y };
    };
    return { background: screen(400, 170), point: screen(200.3, 284.4) };
  });
  await page.mouse.move(position.background.x, position.background.y);
  await page.mouse.down();
  await page.mouse.move(position.background.x + 65, position.background.y + 24, {
    steps: 6,
  });
  await page.mouse.up();
  expect(await svg.getAttribute("viewBox")).not.toBe(initialBox);
  await expect(scene).toHaveAttribute("data-t", initialT);
  await scene.locator('[data-action="reset-view"]').click();

  // Drag the orange point => update mathematical state, not camera.
  const currentPoint = await svg.evaluate((node) => {
    const matrix = node.getScreenCTM();
    const p = new DOMPoint(200.3, 284.4).matrixTransform(matrix);
    const target = new DOMPoint(273.4, 357.6).matrixTransform(matrix);
    return { start: { x: p.x, y: p.y }, end: { x: target.x, y: target.y } };
  });
  await page.mouse.move(currentPoint.start.x, currentPoint.start.y);
  await page.mouse.down();
  await page.mouse.move(currentPoint.end.x, currentPoint.end.y, { steps: 6 });
  await page.mouse.up();
  expect(+(await scene.getAttribute("data-t"))).toBeGreaterThan(1.8);
  await expect(svg).toHaveAttribute("viewBox", initialBox);
  expect(+(await svg.getAttribute("data-scale-x"))).toBeCloseTo(
    +(await svg.getAttribute("data-scale-y")), 8,
  );
});

test("second figure: changing proof step reveals the explanation near navigation", async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(pathToFileURL(resolve("dist/index.html")).href);
  const scene = page.locator("#scene-two"),
    next = scene.locator('[data-action="next-stage"]'),
    explanation = scene.locator(".proof-copy");
  await next.click();
  await expect(scene.locator(".proof-copy h3")).toHaveText("2. Правило цепочки");
  const nav = await scene.locator(".proof-navigation").boundingBox();
  const explanationBox = await explanation.boundingBox();
  const controls = await scene.locator(".controls").boundingBox();
  expect(explanationBox.y).toBeGreaterThanOrEqual(nav.y);
  // Allow small overlapping border/padding extents; the step's prose and
  // equations must still be directly above the controls and in the viewport.
  expect(explanationBox.y + explanationBox.height).toBeLessThanOrEqual(controls.y + 12);
  // The user must see the newly updated text immediately after clicking.
  const visible = await explanation.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return rect.top >= -1 && rect.top + Math.min(rect.height, 80) <= innerHeight + 1;
  });
  expect(visible).toBe(true);
});
