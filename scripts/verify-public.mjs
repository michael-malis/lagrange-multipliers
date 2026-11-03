import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
mkdirSync("test-results", { recursive: true });
const url = "https://michael-malis.github.io/lagrange-multipliers/";
const expected = process.env.EXPECTED_SHA || execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [],
    failures = [],
    external = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", (request) => failures.push(request.url()));
  page.on("request", (request) => {
    if (/^https?:/.test(request.url()) && !request.url().startsWith(url))
      external.push(request.url());
  });
  let matched = false;
  for (let attempt = 0; attempt < 12; attempt++) {
    errors.length = 0;
    failures.length = 0;
    external.length = 0;
    const response = await page.goto(`${url}?verify=${Date.now()}`, {
      waitUntil: "networkidle",
    });
    const build = await page.locator("html").getAttribute("data-build");
    if (
      response.status() === 200 &&
      build &&
      (!expected || build === expected)
    ) {
      matched = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  assert(matched, "Current public build was not observed");
  assert((await page.locator(".katex").count()) > 0);
  await expect(page.locator("[data-scene]")).toHaveCount(3);
  for (const id of ["scene-one", "scene-three"])
    await expect(page.locator(`#${id} .world`)).toHaveAttribute(
      "data-webgl",
      "ready",
    );
  await page.locator("#scene-one [data-action=optimum]").click();
  await expect(page.locator("#scene-one [data-value=height]")).toHaveText(
    "2,333",
  );
  await page.locator("#scene-one [data-action=sections]").click();
  await expect(page.locator("#scene-one [data-value=fx]")).toHaveText("2,667");
  for (let i = 0; i < 3; i++)
    await page.locator('#scene-two [data-action="next-stage"]').click();
  await page.locator("#scene-two [data-action=optimum]").click();
  await expect(page.locator("#scene-two .proof-status")).toContainText(
    "λ = 8/3",
  );
  await page.locator("#scene-three [data-action=global]").click();
  await expect(page.locator("#scene-three [data-value=height]")).toHaveText(
    "2",
  );
  await page.locator("#scene-three [data-action=minimum-plus]").click();
  await expect(page.locator("#scene-three [data-value=lambda]")).toHaveText(
    "-1",
  );
  for (const id of ["scene-one", "scene-two", "scene-three"]) {
    await page.locator(`#${id} [data-action=reset]`).click();
    await expect(page.locator(`#${id}`)).toHaveAttribute(
      "data-t",
      String(id === "scene-three" ? Math.PI : 1),
    );
  }
  await page.evaluate(() => document.fonts.ready);
  assert(await page.evaluate(() => document.fonts.check("16px KaTeX_Main")));
  assert.deepEqual(external, [], "External runtime dependencies");
  assert.deepEqual(failures, [], "Failed resources");
  assert.deepEqual(errors, [], "Browser errors");
  await page.screenshot({
    path: "test-results/public-verified.png",
    fullPage: false,
  });
  console.log(
    `Public HTTP 200, current SHA, fonts, three scenes, interactions, reset and clean network/console verified: ${await page.locator("html").getAttribute("data-build")}`,
  );
} finally {
  await browser.close();
}
