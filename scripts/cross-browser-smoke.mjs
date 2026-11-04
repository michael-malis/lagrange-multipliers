import { firefox, webkit } from "@playwright/test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Small cross-engine smoke against the fully self-contained production HTML.
// Full gesture tests remain in the Chromium integration suite.
const uri = pathToFileURL(resolve("dist/index.html")).href;
for (const [name, engine] of [["Firefox", firefox], ["WebKit", webkit]]) {
  const browser = await engine.launch({headless:true});
  try {
    const context = await browser.newContext({viewport:{width:1280,height:800}});
    await context.setOffline(true);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(uri, {waitUntil:"load", timeout:30000});
    assert.match(await page.locator("h1").textContent(), /Лагранжа/);
    assert.equal(await page.locator("[data-scene]").count(), 3);
    assert((await page.locator(".katex").count()) > 30);
    assert.equal(await page.locator(".katex-error").count(), 0);
    await page.locator('#scene-two [data-action="optimum"]').click();
    assert.equal(await page.locator("#scene-one").getAttribute("data-t"), String(5/3));
    await page.getByRole("button", {name:"Переключить режим чтения и демонстрации"}).click();
    assert.equal(await page.locator("body").getAttribute("data-mode"), "demo");
    await page.locator("[data-demo-next]").click();
    assert.equal(await page.locator("#geometry").getAttribute("data-demo-active"), "true");
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("body").getAttribute("data-mode"), "read");
    assert.deepEqual(errors,[], `${name} JavaScript errors`);
    console.log(`${name}: offline HTML, KaTeX, shared t, demo navigation and no JS errors PASS`);
    await context.close();
  } finally {
    await browser.close();
  }
}
