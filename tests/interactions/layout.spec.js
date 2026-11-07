import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
for (const [width, height] of [
  [1920, 1080],
  [1440, 900],
  [1280, 800],
  [390, 844],
])
  test(`article layout ${width}x${height}`, async ({ page, context }) => {
    await page.setViewportSize({ width, height });
    await context.setOffline(true);
    await page.goto(pathToFileURL(resolve("dist/index.html")).href);
    await expect(page.locator("[data-scene]")).toHaveCount(3);
    // Shortcut help deliberately uses a single accessible native <details>.
    await expect(page.locator("details")).toHaveCount(1);
    await expect(page.locator(".demo-toolbar details.demo-help")).toHaveCount(1);
    await expect(page.locator(".demo-help")).not.toHaveAttribute("open", "");
    await expect(page.locator("#extras")).toHaveCount(0);
    await expect(page.locator(".katex-error")).toHaveCount(0);
    expect(
      await page.evaluate(() =>
        /(?:18\s+минут|минутн|тайминг|0:00)/iu.test(
          document.body.innerText,
        ),
      ),
    ).toBe(false);
    const fontSizes = await page.evaluate(() => [...new Set(
      [...document.querySelectorAll("body *")]
        .filter(node => !node.closest(".katex,svg") &&
          getComputedStyle(node).display !== "none")
        .map(node => getComputedStyle(node).fontSize)
    )]);
    // Editorial hierarchy uses a restrained scale rather than freezing an
    // incidental count of CSS font sizes across responsive breakpoints.
    expect(fontSizes.length).toBeGreaterThanOrEqual(4);
    expect(fontSizes.length).toBeLessThanOrEqual(15);
    const overflow = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      items: [...document.querySelectorAll("body *")].filter(el => {
        const rect = el.getBoundingClientRect();
        return getComputedStyle(el).display !== "none" && rect.width && (rect.right > innerWidth + .5 || rect.left < -.5);
      }).slice(0, 12).map(el => ({tag: el.tagName, class: el.className?.baseVal || el.className, text: el.textContent?.slice(0, 32), right: el.getBoundingClientRect().right}))
    }));
    expect(overflow, JSON.stringify(overflow)).toMatchObject({width: expect.any(Number)});
    expect(overflow.width, JSON.stringify(overflow.items)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/article-${width}.png` });
    for (const id of ["scene-one", "scene-two", "scene-three"]) {
      const scene = page.locator("#" + id);
      await scene.scrollIntoViewIfNeeded();
      await scene.screenshot({ path: `test-results/${id}-${width}.png` });
      const buttons = scene.getByRole("button");
      for (let i = 0; i < (await buttons.count()); i++) {
        const b = buttons.nth(i);
        if (await b.isVisible()) {
          const box = await b.boundingBox();
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        }
      }
    }
    await expect(page.locator(".katex-error")).toHaveCount(0);
    if (width >= 1280) {
      const plane = await page.locator("#scene-two .plane").boundingBox();
      expect(plane.width).toBeGreaterThan(475);
      const scale = await page.locator("#scene-two .plane").evaluate((svg) => ({
        x: +svg.dataset.scaleX,
        y: +svg.dataset.scaleY,
      }));
      expect(scale.x).toBeCloseTo(scale.y, 8);
      await expect(page.locator("#scene-two .stage-meter")).toHaveCount(1);
      await expect(page.locator("#scene-two [data-step-indicator]")).toHaveCount(0);
      await expect(page.locator('#scene-two [data-action="next-stage"]')).toBeVisible();
      const world = await page.locator("#scene-three .world").boundingBox();
      const row = await page.locator("#scene-three .scene-layout").boundingBox();
      expect(Math.abs(world.y + world.height - (row.y + row.height))).toBeLessThan(3);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });

test("200% text reflow keeps mathematical graph controls reachable on narrow screens", async ({page, context}) => {
  await context.setOffline(true);
  for (const width of [320, 360, 390, 720]) {
    await page.setViewportSize({width, height: 900});
    await page.goto(pathToFileURL(resolve("dist/index.html")).href);
    await page.addStyleTag({content: "html {font-size: 200% !important}"});
    const controls = page.locator("#scene-two .plot-view-buttons button");
    await expect(controls).toHaveCount(3);
    const geometry = await controls.evaluateAll(buttons => ({
      buttons: buttons.map(button => {
        const b = button.getBoundingClientRect();
        return {left: b.left, right: b.right, width: b.width};
      }),
      viewport: innerWidth, overflow: document.documentElement.scrollWidth - innerWidth,
    }));
    expect(geometry.overflow).toBeLessThanOrEqual(0);
    // The mid-width breakpoint must also reflow long scene-header actions.
    const headers = await page.locator(".scene-top button").evaluateAll(buttons => buttons.map(node => {
      const r=node.getBoundingClientRect();
      return {left:r.left,right:r.right};
    }));
    for (const rect of headers) {
      expect(rect.left).toBeGreaterThanOrEqual(-1);
      expect(rect.right).toBeLessThanOrEqual(width + 1);
    }
    for (const rect of geometry.buttons) {
      expect(rect.left).toBeGreaterThanOrEqual(-1);
      expect(rect.right).toBeLessThanOrEqual(width + 1);
      expect(rect.width).toBeGreaterThan(30);
    }
    await page.screenshot({path: `test-results/text-200-percent-${width}.png`});
  }
});

test("academic dark palette preserves WCAG AA text contrast and readable UI labels", async ({page, context}) => {
  await context.setOffline(true);
  await page.goto(pathToFileURL(resolve("dist/index.html")).href);
  const report = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    const colors = ["--ink", "--text", "--muted", "--accent", "--blue", "--orange", "--teal", "--violet"];
    const toRgb = value => {
      const canvas = document.createElement("canvas").getContext("2d");
      canvas.fillStyle = value.trim();
      return canvas.fillStyle.match(/^#/) ? [1,3,5].map(i=>parseInt(canvas.fillStyle.slice(i,i+2),16)/255)
        : canvas.fillStyle.match(/[\d.]+/g).slice(0,3).map(x=>+x/255);
    };
    const lightness = c => c.map(x => x <= .04045 ? x/12.92 : ((x+.055)/1.055)**2.4)
      .reduce((acc, value, index) => acc + value*[.2126,.7152,.0722][index],0);
    const ratio = (a,b) => {
      const hi=Math.max(lightness(toRgb(a)),lightness(toRgb(b)));
      const lo=Math.min(lightness(toRgb(a)),lightness(toRgb(b)));
      return (hi+.05)/(lo+.05);
    };
    return colors.map(name=>({name, contrast:ratio(css.getPropertyValue(name), css.getPropertyValue("--surface-raised"))}));
  });
  for (const c of report) expect(c.contrast, c.name).toBeGreaterThanOrEqual(4.5);
  const small = await page.locator(".scene-label").first().evaluate(n => parseFloat(getComputedStyle(n).fontSize));
  expect(small).toBeGreaterThanOrEqual(14);
});
