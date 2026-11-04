import katex from "katex";
import { texLabels } from "../i18n/catalog.js";
const language = () => document.documentElement.lang === "en" ? "en-US" : "ru-RU";
export const number = (x, digits = 3) =>
  Math.abs(x) < 1e-9
    ? "0"
    : x.toLocaleString(language(), { maximumFractionDigits: digits });
export const pair = (v) => `(${v.map((x) => number(x)).join(language() === "en-US" ? ", " : "; ")})`;
export const localizedTex = (tex) =>
  language() === "en-US"
    ? Object.entries(texLabels).reduce((source, [ru, english]) =>
        source.replaceAll(ru, english), tex)
    : tex;
export const math = (tex, display = false) =>
  katex.renderToString(localizedTex(tex), {
    displayMode: display,
    throwOnError: true,
    output: "htmlAndMathml",
  });
export function renderMath(root = document) {
  root.querySelectorAll("[data-tex]").forEach((el) => {
    katex.render(localizedTex(el.dataset.tex), el, {
      displayMode: el.classList.contains("equation"),
      throwOnError: true,
    });
  });
}

export function rerenderLocalizedMath() {
  // Most mathematical notation does not depend on language. Update only the
  // handful of \text{} labels, retaining source data-tex and all scene state.
  for (const el of document.querySelectorAll("[data-tex]")) {
    if (!Object.keys(texLabels).some((phrase) => el.dataset.tex.includes(phrase)))
      continue;
    katex.render(localizedTex(el.dataset.tex), el, {
      displayMode: el.classList.contains("equation"),
      throwOnError: true,
    });
  }
}
