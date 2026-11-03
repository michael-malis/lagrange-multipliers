import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const url = pathToFileURL(resolve("dist/index.html")).href;
test("offline: zero external requests, loaded fonts and complete three-scene article", async ({
  page,
  context,
}) => {
  const errors = [],
    requests = [],
    failures = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (e) => {
    if (e.type() === "error") errors.push(e.text());
  });
  page.on("request", (r) => {
    if (/^https?:/.test(r.url())) requests.push(r.url());
  });
  page.on("requestfailed", (r) => failures.push(r.url()));
  await context.setOffline(true);
  await context.route(/^https?:/, (route) => route.abort());
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() => document.fonts.check("16px KaTeX_Main")),
  ).toBe(true);
  await page.locator("#scene-one [data-action=optimum]").click();
  await expect(page.locator("#scene-one [data-value=height]")).toHaveText(
    "2,333",
  );
  for (let i = 0; i < 3; i++)
    await page.locator('#scene-two [data-action="next-stage"]').click();
  await page.locator("#scene-two [data-action=optimum]").click();
  await expect(page.locator("#scene-two .proof-status")).toContainText("λ");
  await page.locator("#scene-three [data-action=global]").click();
  await expect(page.locator("#scene-two .proof-status .katex")).toHaveCount(2);
  await expect(page.locator("#scene-three [data-value=height]")).toHaveText(
    "2",
  );
  await page.locator('#scene-three [data-action="switch-model"]').click();
  await expect(page.locator(".katex-error")).toHaveCount(0);
  expect(await page.locator(".katex").count()).toBeGreaterThan(70);
  expect(requests).toEqual([]);
  expect(failures).toEqual([]);
  expect(errors).toEqual([]);
});
test("WebGL unavailable: meaningful fallback and working controls", async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /^webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await expect(page.locator(".world[data-webgl=fallback]")).toHaveCount(2);
  await expect(page.locator(".fallback")).toHaveCount(2);
  await page.locator("#scene-one [data-action=optimum]").click();
  await expect(page.locator("#scene-one [data-value=height]")).toHaveText(
    "2,333",
  );
  await page.locator("#scene-three [data-action=global]").click();
  await expect(page.locator("#scene-three [data-value=height]")).toHaveText(
    "2",
  );
  await page
    .locator("#scene-one")
    .screenshot({ path: "test-results/fallback-surface.png" });
  await page
    .locator("#scene-three")
    .screenshot({ path: "test-results/fallback-cylinder.png" });
  expect(errors).toEqual([]);
});
test("WebGL context loss keeps fallback synchronized after later input", async ({
  page,
}) => {
  await page.goto(url);
  await page
    .locator("#scene-one canvas")
    .evaluate((canvas) =>
      canvas
        .getContext("webgl2")
        .getExtension("WEBGL_lose_context")
        .loseContext(),
    );
  await expect(page.locator("#scene-one .world")).toHaveAttribute(
    "data-webgl",
    "lost",
  );
  await page.locator("#scene-one [data-action=optimum]").click();
  const position = JSON.parse(
    await page.locator("#scene-one .world").getAttribute("data-position"),
  );
  expect(position[2]).toBeCloseTo(7 / 3, 12);
  await expect(page.locator("#scene-one .fallback circle")).toHaveCount(1);
});
test("touch: profile, circle and keyboard alternatives remain operable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    offline: true,
  });
  const page = await context.newPage();
  await page.goto(url);
  const scene = page.locator("#scene-one");
  await scene.locator(".profile").scrollIntoViewIfNeeded();
  let box = await scene.locator(".profile").boundingBox();
  await page.touchscreen.tap(box.x + box.width * 0.7, box.y + box.height * 0.4);
  expect(+(await scene.getAttribute("data-t"))).toBeGreaterThan(1.5);
  const circle = page.locator("#scene-three .circle-plot");
  await circle.scrollIntoViewIfNeeded();
  box = await circle.boundingBox();
  await page.touchscreen.tap(box.x + box.width * 0.7, box.y + box.height * 0.5);
  expect(
    +(await page.locator("#scene-three").getAttribute("data-t")),
  ).toBeCloseTo(0, 4);
  await page.locator("#gradient-t").focus();
  await page.keyboard.press("ArrowRight");
  expect(
    +(await page.locator("#scene-two").getAttribute("data-t")),
  ).toBeGreaterThan(1);
  await context.close();
});
