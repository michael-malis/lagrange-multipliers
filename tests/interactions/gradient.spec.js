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
  // A continuously repainted WebGL sibling can make Playwright wait for a
  // stationary bounding box indefinitely after a large screenshot scroll.
  // Other tests cover physical pointer activation; this tests the state update.
  await s.locator("[data-action=optimum]").dispatchEvent("click");
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
  await expect(s.locator(".proof-status")).toContainText("λ");
  await s.screenshot({ path: "test-results/proof-normal.png" });
  const first = page.locator("#scene-one");
  await first.getByRole("button", { name: "Точно в максимум" }).click();
  await expect(s).toHaveAttribute("data-t", String(5 / 3));
  await s.locator("[data-action=reset]").click();
  await expect(s).toHaveAttribute("data-t", "1");
  await expect(s).toHaveAttribute("data-step", "0");
  await expect(first).toHaveAttribute("data-t", "1");
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
    return { background: screen(400, 170) };
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
    const marker = node.querySelector("circle.point");
    const px = Number(marker.getAttribute("cx"));
    const py = Number(marker.getAttribute("cy"));
    const scale = Number(node.dataset.scaleX);
    // Move one mathematical unit along r(t)=(t,3-t).
    const p = new DOMPoint(px, py).matrixTransform(matrix);
    const target = new DOMPoint(px + scale, py + scale).matrixTransform(matrix);
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
  // The text begins before the controls rather than being appended below the
  // full-size plots; the viewport check below governs actual visibility.
  expect(explanationBox.y).toBeLessThan(controls.y);
  // The user must see the newly updated text immediately after clicking.
  const visible = await explanation.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return rect.top >= -1 && rect.top + Math.min(rect.height, 80) <= innerHeight + 1;
  });
  expect(visible).toBe(true);
});

test("default contour viewport is centered and fully contains the outer ellipse", async ({ page, context }) => {
  await context.setOffline(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(resolve("dist/index.html")).href);
  const svg = page.locator("#scene-two svg.plane");
  await expect(svg).toHaveAttribute("data-zoom", "1");
  const geometry = await svg.evaluate((node) => {
    const outer = node.querySelector('ellipse.contour[data-level="-6"]');
    const clip = node.querySelector("clipPath rect");
    const x = Number(outer.getAttribute("cx"));
    const y = Number(outer.getAttribute("cy"));
    const rx = Number(outer.getAttribute("rx"));
    const ry = Number(outer.getAttribute("ry"));
    const left = Number(clip.getAttribute("x"));
    const top = Number(clip.getAttribute("y"));
    const right = left + Number(clip.getAttribute("width"));
    const bottom = top + Number(clip.getAttribute("height"));
    return {x, y, rx, ry, left, right, top, bottom,
      scaleX: Number(node.dataset.scaleX), scaleY: Number(node.dataset.scaleY)};
  });
  expect(geometry.scaleX).toBeCloseTo(geometry.scaleY, 10);
  expect(geometry.x).toBeCloseTo((geometry.left + geometry.right) / 2, 10);
  expect(geometry.y).toBeCloseTo((geometry.top + geometry.bottom) / 2, 10);
  expect(geometry.x - geometry.rx).toBeGreaterThan(geometry.left + 10);
  expect(geometry.x + geometry.rx).toBeLessThan(geometry.right - 10);
  expect(geometry.y - geometry.ry).toBeGreaterThan(geometry.top + 10);
  expect(geometry.y + geometry.ry).toBeLessThan(geometry.bottom - 10);
  await svg.screenshot({ path: "test-results/level-contours-default-centered.png" });
});

test("axis labels follow the visible coordinate window after zoom and pan", async ({ page, context }) => {
  await context.setOffline(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(resolve("dist/index.html")).href);
  const scene = page.locator("#scene-two");
  const plane = scene.locator("svg.plane");
  const ticks = plane.locator(".axis-tick-labels text.tick");
  await expect(ticks.first()).toBeVisible();
  const initial = await ticks.allTextContents();
  const initialT = await scene.getAttribute("data-t");
  // The tick spacing changes to half-units only beyond zoom 1.75.
  for (let i = 0; i < 3; i++)
    await scene.locator('[data-action="zoom-in"]').click();
  const zoomed = await ticks.allTextContents();
  expect(zoomed).not.toEqual(initial);
  expect(zoomed.some(value => value.includes(".5"))).toBe(true);
  await expect(scene).toHaveAttribute("data-t", initialT);
  const beforePan = await plane.getAttribute("viewBox");
  // Choose a point inside the currently *visible* viewport. A fixed
  // SVG coordinate can end up outside the canvas after repeated zooming.
  const target = await plane.evaluate(node => {
    const rect = node.getBoundingClientRect();
    return {x: rect.left + rect.width * .72, y: rect.top + rect.height * .22};
  });
  await page.mouse.move(target.x, target.y);
  await page.mouse.down();
  await page.mouse.move(target.x - 180, target.y + 90, {steps: 5});
  await page.mouse.up();
  expect(await plane.getAttribute("viewBox")).not.toBe(beforePan);
  expect(await ticks.allTextContents()).not.toEqual(zoomed);
  await expect(scene).toHaveAttribute("data-t", initialT);
  await scene.locator('[data-action="reset-view"]').click();
  expect(await ticks.allTextContents()).toEqual(initial);
  await plane.screenshot({ path: "test-results/axis-labels-after-reset.png" });
});

test("keyboard can pan, zoom and reset the focused contour without altering its point", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(pathToFileURL(resolve("dist/index.html")).href);
  const scene = page.locator("#scene-two");
  const svg = scene.locator("svg.plane");
  await svg.focus();
  await expect(svg).toBeFocused();
  const initial = await svg.getAttribute("viewBox");
  const t = await scene.getAttribute("data-t");
  await page.keyboard.press("ArrowRight");
  expect(await svg.getAttribute("viewBox")).not.toBe(initial);
  await expect(scene).toHaveAttribute("data-t", t);
  await page.keyboard.press("+");
  expect(+(await svg.getAttribute("data-zoom"))).toBeGreaterThan(1);
  await page.keyboard.press("Home");
  await expect(svg).toHaveAttribute("viewBox", initial);
  await expect(scene).toHaveAttribute("data-t", t);
});

test("Lagrange right-angle mark and zero-gradient projection appear only at the optimum", async ({page, context}) => {
  await context.setOffline(true);
  await page.goto(pathToFileURL(resolve("dist/index.html")).href);
  const scene=page.locator("#scene-two");
  for (let i=0;i<3;i++) await scene.locator('[data-action="next-stage"]').click();
  await expect(scene).toHaveAttribute("data-step","3");
  await scene.locator("[data-action=after]").click();
  await expect(scene.locator(".right-angle")).toHaveCount(0);
  await expect(scene.locator("[data-zero-projection]")).toHaveCount(0);
  const formula=await scene.locator("[data-formula] annotation").allTextContents();
  expect(formula.join(" ")).toContain("P_{\\max}");
  await scene.locator("[data-action=optimum]").click();
  await expect(scene.locator(".right-angle")).toHaveCount(1);
  await expect(scene.locator("[data-zero-projection]")).toHaveCount(1);
  await expect(scene.locator("[data-value=projection-coefficient]")).toHaveText("0");
});
