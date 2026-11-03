import { readFileSync, writeFileSync } from "node:fs";
const notices = ["three", "katex"]
  .map(
    (name) =>
      `${name}\n${readFileSync(`node_modules/${name}/LICENSE`, "utf8")}`,
  )
  .join("\n\n");
const path = "dist/index.html";
writeFileSync(
  path,
  readFileSync(path, "utf8").replace(
    "</html>",
    `<!-- Third-party notices\n${notices.replaceAll("--", "—")}\n-->\n</html>`,
  ),
);
