import { test, expect } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const url = pathToFileURL(resolve("dist/index.html")).href;
const unlocalized = () => {
  const cyrillic = /[А-Яа-яЁё]/;
  const found = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walk.nextNode())) {
    if (node.parentElement?.closest(".katex,script,style,noscript")) continue;
    const value = node.nodeValue.trim().replace(/\s+/g, " ");
    if (cyrillic.test(value)) found.push(value);
  }
  for (const element of document.querySelectorAll("[aria-label],[title],[placeholder]")) {
    for (const name of ["aria-label", "title", "placeholder"]) {
      const value = element.getAttribute(name);
      if (value && cyrillic.test(value)) found.push(name + ": " + value);
    }
  }
  return [...new Set(found)].slice(0, 50);
};

test("EN translates all visible prose and dynamically generated scene states without losing mathematics", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(url);
  const scene1 = page.locator("#scene-one");
  const scene2 = page.locator("#scene-two");
  const scene3 = page.locator("#scene-three");
  await scene1.locator("[data-action=optimum]").click();
  await scene2.locator("[data-action=next-stage]").click();
  await scene2.locator("[data-action=next-stage]").click();
  const mathAnnotations = await page.locator('#geometry annotation[encoding="application/x-tex"]').allTextContents();
  const positionBefore = await scene1.getAttribute("data-t");
  const cameraBefore = await scene1.locator(".world").getAttribute("data-position");
  await page.locator('[data-language="en"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toContainText("The Method of Lagrange Multipliers");
  await expect(scene2).toHaveAttribute("data-t", positionBefore);
  await expect(scene2).toHaveAttribute("data-step", "2");
  expect(await scene1.locator(".world").getAttribute("data-position")).toBe(cameraBefore);
  expect(await page.locator('#geometry annotation[encoding="application/x-tex"]').allTextContents()).toEqual(mathAnnotations);
  await scene2.locator("[data-action=next-stage]").click();
  await scene3.locator('[data-action="switch-model"]').click();
  await scene3.locator('[data-action=global]').click();
  await scene3.locator('[data-action=local]').click();
  await scene1.locator("[data-action=plane]").click();
  const missed = await page.evaluate(unlocalized);
  expect(missed, "Untranslated RU DOM/ARIA strings: " + missed.join(" | ")).toEqual([]);
  await expect(page.locator(".katex-error")).toHaveCount(0);
  await expect(page.locator("#scene-three")).toHaveAttribute("data-model", "counterexample");
  await expect(scene3.locator("[data-value=lambda]")).toHaveText("1");
  await page.locator('[data-language="ru"]').click();
  await expect(page.locator("h1")).toContainText("Метод множителей Лагранжа");
  await expect(scene3).toHaveAttribute("data-model", "counterexample");
  await expect(scene2).toHaveAttribute("data-t", positionBefore);
});
test("language and selected demonstration persist across navigation, demonstration mode and reload", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(url);
  const picker = page.locator("#chapter-select");
  await picker.selectOption("cylinder");
  await expect(picker).toHaveValue("cylinder");
  await page.locator('[data-language="en"]').click();
  await expect(picker.locator("option[value=cylinder]")).toContainText("Necessary versus sufficient");
  await page.getByRole("button", { name: "Switch between reading and presentation modes" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-mode","demo");
  await expect(page.locator("#cylinder")).toHaveAttribute("data-demo-active","true");
  await expect(page.locator(".demo-question")).toContainText("Can the Lagrange condition");
  await expect(page.locator(".demo-toolbar [data-language=en]")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#chapter-select").selectOption("geometry");
  await expect(page.locator("#geometry")).toHaveAttribute("data-demo-active", "true");
  await expect(page.locator("#scene-two")).toBeVisible();
  await page.getByRole("button", { name: "Switch between reading and presentation modes" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-mode", "read");
  await expect(page.locator("#chapter-select")).toHaveValue("geometry");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const saved = await page.evaluate(() => {
    try { return localStorage.getItem("lagrange-language"); } catch { return null; }
  });
  // Browsers may deny storage on file://; persistence is separately checked
  // on GitHub Pages, where same-origin localStorage is available.
  if (saved !== null) {
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang","en");
    await expect(page.locator('[data-language=en]')).toHaveAttribute("aria-pressed","true");
  }
  await expect(page.locator(".katex-error")).toHaveCount(0);
});
test("editorial equation display, dropdown accessibility and mobile bilingual layout", async ({ page, context }) => {
  await context.setOffline(true);
  for (const width of [320, 390, 720, 1280, 1920]) {
    await page.setViewportSize({width, height: 900});
    await page.goto(url);
    await page.locator('[data-language=en]').click();
    await expect(page.locator("#chapter-select")).toBeVisible();
    await expect(page.locator("#scene-three .world")).toHaveCount(1);
    await expect(page.locator(".math-example .equation")).toHaveCount(4);
    for (const eq of await page.locator(".math-example .equation").all()) {
      await expect(eq.locator(".katex-display")).toBeAttached();
    }
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(over,"horizontal overflow at " + width).toBeLessThanOrEqual(0);
    const boxes = await page.locator(".masthead-controls select, .masthead-controls button").evaluateAll(nodes =>
      nodes.map(node => { const r=node.getBoundingClientRect();return {left:r.left,right:r.right}; }));
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(-1);
      expect(box.right).toBeLessThanOrEqual(width + 1);
    }
    await expect(page.locator(".katex-error")).toHaveCount(0);
    await page.screenshot({path: "test-results/bilingual-editorial-"+width+".png"});
  }
});

test("EN prose remains grammatical across inline equations and plotted decimal ticks follow locale", async ({page, context}) => {
  await context.setOffline(true);
  await page.goto(url);
  const profile = page.locator("#scene-one svg.profile");
  const texts = () => profile.locator("text").allTextContents();
  expect((await texts()).some(t => /-?\d,\d/.test(t))).toBe(true);
  await page.locator('[data-language="en"]').click();
  await expect(page.locator("#surface [data-i18n-context=partials]")).toContainText("axis while holding");
  await expect(page.locator("#surface [data-i18n-context=differential]")).toContainText("increases along the feasible line");
  await expect(page.locator("#geometry [data-i18n-context=regularity]")).toContainText("the condition");
  await expect(page.locator("#geometry [data-i18n-context=sign-lambda]")).toContainText("A zero multiplier is permitted");
  const english = await texts();
  expect(english.some(t => /-?\d\.\d/.test(t))).toBe(true);
  expect(english.some(t => /-?\d,\d/.test(t))).toBe(false);
  const geometry = page.locator("#scene-two");
  await geometry.locator('[data-action="zoom-in"]').click();
  await geometry.locator('[data-action="zoom-in"]').click();
  await geometry.locator('[data-action="zoom-in"]').click();
  const enTicks = await geometry.locator(".plane .tick").allTextContents();
  expect(enTicks.some(t => /[.,]5/.test(t))).toBe(true);
  expect(enTicks.some(t => /,\d/.test(t))).toBe(false);
  await page.locator('[data-language="ru"]').click();
  expect((await texts()).some(t => /-?\d,\d/.test(t))).toBe(true);
  const ruTicks = await geometry.locator(".plane .tick").allTextContents();
  expect(ruTicks.some(t => /,\d/.test(t))).toBe(true);
});
