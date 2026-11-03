import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
test('self-contained file opens offline with rendered math', async ({ page, context }) => {
  await context.setOffline(true);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(pathToFileURL(resolve('dist/index.html')).href);
  await expect(page.locator('h1')).toContainText('Лагранжа');
  await expect(page.locator('.katex').first()).toBeVisible();
  expect(errors).toEqual([]);
});
