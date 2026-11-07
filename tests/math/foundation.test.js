import { test, expect } from "vitest";
import { readFileSync } from "node:fs";
test("the entry document defaults to English and is accessible", () => {
  const html = readFileSync("index.html", "utf8");
  expect(html).toContain('lang="en"');
  expect(html).toContain('name="viewport"');
});

test("static SEO and social cards are English without executing JavaScript", () => {
  const html = readFileSync("index.html", "utf8");
  const title = "The Method of Lagrange Multipliers — Interactive Geometry";
  const description = "An interactive lesson on Lagrange multipliers: feasible motion, tangency and gradients, stationary candidates, and a counterexample.";
  expect(html).toContain(`<title>${title}</title>`);
  expect(html).toContain(`content="${description}"`);
  expect(html).toContain('property="og:locale" content="en_US"');
  expect(html).toContain(`property="og:title" content="${title}"`);
  expect(html).toContain(`property="og:description" content="${description}"`);
  expect(html).toContain(`name="twitter:title" content="${title}"`);
  expect(html).toContain(`name="twitter:description" content="${description}"`);
  expect(html).toContain('property="og:locale:alternate" content="ru_RU"');
  expect(html).toContain('rel="canonical" href="https://michael-malis.github.io/lagrange-multipliers/"');
});
