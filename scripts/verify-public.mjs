import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const url = 'https://michael-malis.github.io/lagrange-multipliers/';
const expected = process.env.EXPECTED_SHA;
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let matched = false;
  for (let attempt = 0; attempt < 12; attempt++) {
    const response = await page.goto(`${url}?verify=${Date.now()}`, { waitUntil: 'networkidle' });
    const build = await page.locator('html').getAttribute('data-build');
    if (response.status() === 200 && build && (!expected || build === expected)) { matched = true; break; }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  assert(matched, 'Current public build was not observed');
  assert(await page.locator('.katex').count() > 0);
  console.log(`Public HTML and math verified: ${await page.locator('html').getAttribute('data-build')}`);
} finally { await browser.close(); }
