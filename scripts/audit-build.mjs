import { readFileSync, readdirSync } from "node:fs";
import assert from "node:assert/strict";
assert.deepEqual(
  readdirSync("dist"),
  ["index.html"],
  "Production distribution must be exactly one HTML",
);
const html = readFileSync("dist/index.html", "utf8");
assert(!/<script[^>]+src\s*=/i.test(html), "External script");
assert(
  !/<link[^>]+(?:stylesheet|modulepreload)[^>]*>/i.test(html),
  "External stylesheet or module",
);
for (const [, url] of html.matchAll(/url\(\s*["']?([^\s)'";]+)/g)) {
  assert(
    url.startsWith("data:") || url.startsWith("#"),
    `External CSS asset: ${url.slice(0, 120)}`,
  );
}
assert(html.includes("data:font/"), "Fonts must be embedded");
console.log(
  `Single-file audit passed: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MiB, embedded scripts/styles/fonts.`,
);
