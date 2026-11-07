import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

// These legacy regression scenarios intentionally assert the Russian UI.
// English remains the default for first-time visitors.
async function openRussian(page, url) {
  await page.goto(url);
  await page.locator('[data-language="ru"]').first().click();
}

test("self-contained file opens offline with rendered math", async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openRussian(page, pathToFileURL(resolve("dist/index.html")).href);
  await expect(page.locator("h1")).toContainText("Лагранжа");
  await expect(page.locator(".katex").first()).toBeVisible();
  expect(errors).toEqual([]);
});
