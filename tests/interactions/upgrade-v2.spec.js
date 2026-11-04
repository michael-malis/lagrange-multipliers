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
  await expect(scene).toHaveAttribute("data-profile-view", "focus");
  await expect(scene.locator(".counterexample-inset")).toHaveCount(0);
  await expect(scene.locator("[data-focus-controls]")).toBeVisible();
  await expect(scene.locator(".profile .focus-zero")).toHaveCount(2);
  await expect(scene.locator(".profile .focus-origin-label")).toContainText("h′(0) = 0");
  await expect(scene.locator("[data-analysis]")).toContainText("Стационарная точка, не экстремум");
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
  await expect(circle).toHaveAttribute("data-mobile-view", "profile");
  await expect(circle.locator("[data-focus-controls]")).toBeVisible();
  await circle.locator(".mobile-view-toggle").getByRole("button", { name: "Профиль высоты" }).click();
  await expect(circle.locator("[data-profile] svg")).toBeVisible();
  await expect(circle.locator("[data-value=lambda]")).toHaveText("1");
  await expect(page.locator(".katex-error")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("v2: level-set ell renders as one KaTeX symbol, not raw 'ell' or a line break", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  const line = page.locator("#geometry .reading .equation").first();
  await expect(line.locator(".katex")).toBeVisible();
  const latex = await line.locator('annotation[encoding="application/x-tex"]').textContent();
  expect(latex).toContain(String.raw`\ell`);
  expect(latex).toContain("Longleftrightarrow");
  const visibleMath = await line.locator(".katex-html").innerText();
  expect(visibleMath).toContain("ℓ");
  expect(visibleMath).not.toMatch(/\bell\b/);
  await expect(page.locator("#geometry .katex-error")).toHaveCount(0);
});

test("v2: circle classification uses mathematical candidate labels and TeX fractions", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  const analysis = page.locator("#scene-three [data-analysis]");
  const rows = analysis.locator("tbody tr");
  await expect(rows).toHaveCount(4);
  for (const row of await rows.all()) {
    await expect(row.locator("td").first().locator(".katex")).toHaveCount(1);
    await expect(row.locator("td").nth(1).locator(".katex")).toHaveCount(1);
  }
  await expect(analysis.locator(".katex-error")).toHaveCount(0);
});

test("v2: mathematical labels on 3D surfaces and constraints use KaTeX", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  for (const id of ["scene-one", "scene-three"]) {
    await expect(page.locator(`#${id} .world-labels .katex`)).toHaveCount(2);
  }
  const circle = page.locator("#scene-three");
  await circle.locator('[data-action="switch-model"]').click();
  await expect(circle.locator("[data-surface-label] .katex")).toBeVisible();
  const raw = await circle.locator("[data-surface-label] annotation").textContent();
  expect(raw).toContain("x^2+y^2-1+y^3");
  await expect(page.locator(".katex-error")).toHaveCount(0);
});

test("demo keyboard navigation preserves math and never hijacks focused inputs", async ({page, context}) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  await page.getByRole("button", {name:"Переключить режим чтения и демонстрации"}).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#geometry")).toHaveAttribute("data-demo-active", "true");
  const scene = page.locator("#scene-two");
  await page.keyboard.press("2");
  await expect(scene).toHaveAttribute("data-t", String(5 / 3));
  const beforeStep = await scene.getAttribute("data-step");
  await scene.locator("#gradient-t").focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).toHaveAttribute("data-step", beforeStep);
  await scene.locator('[data-action="next-stage"]').focus();
  await page.keyboard.press("Enter");
  await expect(scene).toHaveAttribute("data-step", String(+beforeStep + 1));
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).toHaveAttribute("data-mode", "read");
});

test("reduced-motion preserves interactive controls and disables progress animation", async ({page, context}) => {
  await context.setOffline(true);
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto(pageUrl);
  const progress = page.locator("#scene-two [data-progress-fill]");
  const duration = await progress.evaluate(node => getComputedStyle(node).transitionDuration);
  // Computed values may serialize 0.00001s as 1e-05s.
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.0001);
  await page.locator('#scene-two [data-action="next-stage"]').click();
  await expect(page.locator("#scene-two")).toHaveAttribute("data-step", "1");
  await expect(page.locator(".katex-error")).toHaveCount(0);
});

test("all principal SVG controls and scene sliders have accessible descriptions", async ({page, context}) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  for (const id of ["surface-t", "gradient-t", "cylinder-t"]) {
    const input = page.locator("#" + id);
    await expect(input).toHaveCount(1);
    const labelled = await input.evaluate(node => !!node.labels?.length || !!node.getAttribute("aria-label"));
    expect(labelled).toBe(true);
  }
  await expect(page.locator("#scene-two svg.plane")).toHaveAttribute("tabindex", "0");
  for (const s of await page.locator('[data-profile] svg').all()) {
    const attr = await s.getAttribute("aria-label");
    expect(attr?.length).toBeGreaterThan(10);
  }
});

test("repeated mode, camera and model changes do not duplicate scene resources", async ({page, context}) => {
  test.setTimeout(90000);
  await context.setOffline(true);
  await page.goto(pageUrl);
  const count = () => page.evaluate(() => ({
    scenes: document.querySelectorAll("[data-scene]").length,
    canvases: document.querySelectorAll(".world canvas").length,
    profiles: document.querySelectorAll("[data-profile] svg").length,
    listenersRelatedNodes: document.querySelectorAll(".demo-toolbar").length,
    geometry: document.querySelectorAll("#scene-two svg.plane").length,
    circle: document.querySelectorAll("#scene-three svg.circle-plot").length,
  }));
  const baseline = await count();
  for (let i=0; i<15; i++) {
    await page.getByRole("button", {name:"Переключить режим чтения и демонстрации"}).click();
    const previous = page.locator("[data-demo-prev]");
    while (await previous.isEnabled()) await previous.click();
    await page.locator("[data-demo-next]").click();
    await page.locator("[data-demo-next]").click();
    await page.locator("#scene-three [data-action=switch-model]").click();
    await page.getByRole("button", {name:"Переключить режим чтения и демонстрации"}).click();
    await page.locator("#scene-one [data-action=camera-top]").click();
    await page.locator("#scene-one [data-action=camera]").click();
  }
  expect(await count()).toEqual(baseline);
  await expect(page.locator(".katex-error")).toHaveCount(0);
});

test("non-extremum focused profile shows both signs and keeps one draggable model", async ({page, context}) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  const scene = page.locator("#scene-three");
  await scene.locator('[data-action="switch-model"]').click();
  const svg = scene.locator("[data-profile] svg.profile");
  await expect(scene).toHaveAttribute("data-profile-view","focus");
  const curve = svg.locator("path.curve");
  const metrics = await svg.evaluate(node => {
    const path = node.querySelector("path.curve");
    const origin = node.querySelector(".focus-origin-label");
    const box = path.getBBox();
    const center = node.querySelector(".point");
    return {
      curveY: [box.y, box.y + box.height],
      originY: Number(origin.getAttribute("y")) + 12,
      pointX: Number(center.getAttribute("cx")),
      view: node.getAttribute("viewBox")
    };
  });
  expect(metrics.curveY[0]).toBeLessThan(metrics.originY);
  expect(metrics.curveY[1]).toBeGreaterThan(metrics.originY);
  expect(metrics.pointX).toBeCloseTo(191, 0);
  const screen = await svg.evaluate(node => {
    const matrix = node.getScreenCTM();
    const point = (x, y) => {
      const s = new DOMPoint(x,y).matrixTransform(matrix);
      return {x:s.x,y:s.y};
    };
    return {left:point(105, 95), right:point(270, 95)};
  });
  await page.mouse.click(screen.left.x,screen.left.y);
  expect(+(await scene.getAttribute("data-height"))).toBeLessThan(0);
  await expect(scene).toHaveAttribute("data-profile-view","focus");
  await page.mouse.click(screen.right.x,screen.right.y);
  expect(+(await scene.getAttribute("data-height"))).toBeGreaterThan(0);
  await scene.locator('[data-action="profile-full"]').click();
  await expect(scene).toHaveAttribute("data-profile-view","full");
  await expect(svg.locator(".focus-origin-label")).toHaveCount(0);
  await scene.locator('[data-action="profile-focus"]').click();
  await expect(scene).toHaveAttribute("data-profile-view","focus");
  await scene.locator("[data-action=local]").click();
  await expect(scene.locator("[data-value=lambda]")).toHaveText("1");
  await page.screenshot({path:"test-results/counterexample-interactive-focus.png"});
  await scene.locator('[data-action="switch-model"]').click();
  await expect(scene).toHaveAttribute("data-profile-view","full");
  await expect(scene.locator("[data-focus-controls]")).toBeHidden();
});

test("non-extremum focused experiment stays usable in Full HD presentation", async ({page, context}) => {
  await context.setOffline(true);
  await page.setViewportSize({width:1920,height:1080});
  await page.goto(pageUrl);
  await page.getByRole("button", {name:"Переключить режим чтения и демонстрации"}).click();
  await page.locator("[data-demo-next]").click();
  await page.locator("[data-demo-next]").click();
  const scene=page.locator("#scene-three");
  await scene.locator('[data-action="switch-model"]').click();
  await expect(scene).toHaveAttribute("data-profile-view","focus");
  const rect = await scene.locator(".scene-layout").boundingBox();
  expect(rect.y + rect.height).toBeLessThanOrEqual(1080);
  await expect(scene.locator("[data-profile] svg")).toBeVisible();
  await expect(scene.locator("[data-focus-controls]")).toBeVisible();
  await page.screenshot({path:"test-results/counterexample-fullhd-demo.png"});
});

test("the presentation has only one active mathematical position control across 3D and 2D", async ({page, context}) => {
  await context.setOffline(true);
  await page.goto(pageUrl);
  await page.getByRole("button",{name:"Переключить режим чтения и демонстрации"}).click();
  const visibleSliders = async () => page.locator('#scene-one input[type="range"]:visible, #scene-two input[type="range"]:visible').count();
  expect(await visibleSliders()).toBe(1);
  await page.locator("#scene-one [data-action=optimum]").click();
  await page.locator("[data-demo-next]").click();
  expect(await visibleSliders()).toBe(1);
  await expect(page.locator("#scene-two")).toHaveAttribute("data-t",String(5/3));
  await page.locator("#scene-two [data-action=before]").click();
  await expect(page.locator("#scene-one")).toHaveAttribute("data-t","1");
  await page.locator("[data-demo-prev]").click();
  expect(await visibleSliders()).toBe(1);
  await expect(page.locator("#scene-one")).toHaveAttribute("data-t","1");
});
