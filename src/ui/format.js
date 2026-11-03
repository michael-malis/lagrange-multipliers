import katex from "katex";
export const number = (x, digits = 3) =>
  Math.abs(x) < 1e-9
    ? "0"
    : x.toLocaleString("ru-RU", { maximumFractionDigits: digits });
export const pair = (v) => `(${v.map((x) => number(x)).join("; ")})`;
export const math = (tex, display = false) =>
  katex.renderToString(tex, {
    displayMode: display,
    throwOnError: true,
    output: "htmlAndMathml",
  });
export function renderMath(root = document) {
  root.querySelectorAll("[data-tex]").forEach((el) => {
    katex.render(el.dataset.tex, el, {
      displayMode: el.classList.contains("equation"),
      throwOnError: true,
    });
  });
}
