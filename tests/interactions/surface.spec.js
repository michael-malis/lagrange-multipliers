import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

// These legacy regression scenarios intentionally assert the Russian UI.
// English remains the default for first-time visitors.
async function openRussian(page, url) {
  await page.goto(url);
  await page.locator('[data-language="ru"]').first().click();
}

const url = pathToFileURL(resolve("dist/index.html")).href;
test("surface: layers, synchronized values, sections, camera and reset", async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openRussian(page, url);
  const scene = page.locator("#scene-one");
  await scene.scrollIntoViewIfNeeded();
  await expect(scene.locator(".world")).toHaveAttribute("data-webgl", "ready");
  await expect(scene).toHaveAttribute("data-t", "1");
  await scene.screenshot({ path: "test-results/surface-initial.png" });
  await scene.getByRole("button", { name: "Показать ограничение" }).click();
  await expect(scene).toHaveAttribute("data-plane", "true");
  await scene.screenshot({ path: "test-results/surface-constraint.png" });
  await scene.getByRole("button", { name: "Точно в максимум" }).click();
  await expect(scene.locator("[data-value=height]")).toHaveText("2,333");
  const position = JSON.parse(
    await scene.locator(".world").getAttribute("data-position"),
  );
  expect(position[0] + position[1]).toBeCloseTo(3, 12);
  expect(position[2]).toBeCloseTo(7 / 3, 12);
  expect(
    +(await scene.locator(".profile .point").getAttribute("data-height")),
  ).toBeCloseTo(position[2], 12);
  await scene.screenshot({ path: "test-results/surface-optimum.png" });
  await scene.getByRole("group", {name:"Выбор координатного сечения"}).getByRole("button", { name: "Оба" }).click();
  await expect(scene.locator("[data-value=fx]")).toHaveText("2,667");
  await expect(scene.locator("[data-value=fy]")).toHaveText("2,667");
  await scene.screenshot({ path: "test-results/surface-sections.png" });
  await scene.locator('[data-action="section-x"]').click();
  await expect(scene).toHaveAttribute("data-section-mode", "x");
  await scene.screenshot({ path: "test-results/surface-section-x.png" });
  await scene.locator('[data-action="section-y"]').click();
  await expect(scene).toHaveAttribute("data-section-mode", "y");
  await scene.screenshot({ path: "test-results/surface-section-y.png" });
  const box = await scene.locator("canvas").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 70,
    box.y + box.height / 2 + 20,
    { steps: 5 },
  );
  await page.mouse.up();
  expect(+(await scene.getAttribute("data-t"))).toBeCloseTo(5 / 3, 12);
  await scene.getByRole("button", { name: "Сбросить" }).click();
  await expect(scene).toHaveAttribute("data-t", "1");
  await expect(scene).toHaveAttribute("data-plane", "false");
  await expect(scene.locator("[data-value=fx]")).toBeHidden();
  const slider = scene.locator("input");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  expect(+(await scene.getAttribute("data-t"))).toBeGreaterThan(1);
  const plot = await scene.locator(".profile").boundingBox();
  await page.mouse.click(
    plot.x + plot.width * 0.75,
    plot.y + plot.height * 0.4,
  );
  expect(+(await scene.getAttribute("data-t"))).toBeGreaterThan(2);
  await scene.screenshot({ path: "test-results/surface-after.png" });
  expect(errors).toEqual([]);
});

test("surface controls distinguish position, coordinate sections and camera", async ({page, context}) => {
  await context.setOffline(true);
  await openRussian(page, pathToFileURL(resolve("dist/index.html")).href);
  const scene = page.locator("#scene-one");
  await expect(scene.locator(".surface-control-group")).toHaveCount(3);
  await expect(scene.getByRole("group", {name: "Положение точки и ограничение"})).toBeVisible();
  await expect(scene.getByRole("group", {name: "Выбор координатного сечения"})).toBeVisible();
  await expect(scene.getByRole("group", {name: "Положение камеры"})).toBeVisible();
  const initialT = await scene.getAttribute("data-t");
  await scene.getByRole("group", {name: "Положение камеры"}).getByRole("button", {name: "Вид сверху"}).click();
  await expect(scene).toHaveAttribute("data-t", initialT);
  await scene.getByRole("group", {name: "Выбор координатного сечения"}).getByRole("button", {name: "По x"}).click();
  await expect(scene).toHaveAttribute("data-section-mode", "x");
  await scene.getByRole("group", {name: "Положение точки и ограничение"}).getByRole("button", {name: "Точно в максимум"}).click();
  await expect(scene).toHaveAttribute("data-t", String(5 / 3));
});
