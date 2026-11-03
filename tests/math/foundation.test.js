import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
test('the entry document is Russian and accessible', () => {
  const html = readFileSync('index.html', 'utf8');
  expect(html).toContain('lang="ru"');
  expect(html).toContain('name="viewport"');
});
