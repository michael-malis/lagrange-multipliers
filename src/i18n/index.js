import { en, metadata } from "./catalog.js";

const storedText = new WeakMap();
const renderedText = new WeakMap();
const storedAttributes = new WeakMap();
const renderedAttributes = new WeakMap();
const ATTRS = ["aria-label", "title", "placeholder", "alt"];
const CYRILLIC = /[А-Яа-яЁё]/;
const NORMALIZE = /\s+/g;
const KEY = "lagrange-language";
let currentLanguage = "ru";
let observer;
const missing = new Set();

function translatePhrase(source) {
  const key = source.trim().replace(NORMALIZE, " ");
  if (!key) return source;
  const value = en[key];
  if (value === undefined) {
    if (CYRILLIC.test(key)) missing.add(key);
    return source;
  }
  const leading = source.match(/^\s*/u)?.[0] ?? "";
  const trailing = source.match(/\s*$/u)?.[0] ?? "";
  return leading + value + trailing;
}
function skip(el) {
  return !el || !!el.closest(".katex, script, style, noscript, [data-no-i18n]");
}
function updateText(node) {
  if (skip(node.parentElement)) return;
  const now = node.nodeValue;
  const previousRender = renderedText.get(node);
  let source = storedText.get(node);
  // The application always generates Russian text. A new value, including
  // a newly created dynamic node, must replace the prior canonical source.
  if (source === undefined || (now !== previousRender && now !== source)) {
    source = now;
    storedText.set(node, source);
  }
  const next = currentLanguage === "en" ? translatePhrase(source) : source;
  renderedText.set(node, next);
  if (now !== next) node.nodeValue = next;
}
function updateAttributes(el) {
  if (skip(el)) return;
  let originals = storedAttributes.get(el);
  let rendered = renderedAttributes.get(el);
  if (!originals) { originals = new Map(); storedAttributes.set(el, originals); }
  if (!rendered) { rendered = new Map(); renderedAttributes.set(el, rendered); }
  for (const attr of ATTRS) {
    if (!el.hasAttribute(attr)) continue;
    const actual = el.getAttribute(attr);
    let source = originals.get(attr);
    if (source === undefined || (actual !== source && actual !== rendered.get(attr))) {
      source = actual;
      originals.set(attr, source);
    }
    const translated = currentLanguage === "en" ? translatePhrase(source) : source;
    rendered.set(attr, translated);
    if (actual !== translated) el.setAttribute(attr, translated);
  }
}
function translateTree(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    updateText(root);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE || skip(root)) return;
  updateAttributes(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL);
  while (walker.nextNode()) {
    if (walker.currentNode.nodeType === Node.TEXT_NODE)
      updateText(walker.currentNode);
    else if (walker.currentNode.nodeType === Node.ELEMENT_NODE)
      updateAttributes(walker.currentNode);
  }
}
function refresh() {
  translateTree(document.body);
  const meta = metadata[currentLanguage];
  document.documentElement.lang = currentLanguage;
  document.title = meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  for (const button of document.querySelectorAll("[data-language]")) {
    const selected = button.dataset.language === currentLanguage;
    button.setAttribute("aria-pressed", String(selected));
  }
}
export function setLanguage(language) {
  if (language !== "ru" && language !== "en") return;
  currentLanguage = language;
  missing.clear();
  refresh();
  try { localStorage.setItem(KEY, currentLanguage); } catch { /* private file contexts */ }
  document.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
}
export function getLanguage() { return currentLanguage; }
export function getMissingTranslations() {
  return Array.from(missing).sort((a, b) => a.localeCompare(b, "ru"));
}
export function initI18n() {
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });
  let saved;
  try { saved = localStorage.getItem(KEY); } catch { /* file:// may disallow storage */ }
  setLanguage(saved === "en" ? "en" : "ru");
  // Scene code updates status text with innerHTML, textContent and SVG titles.
  // Translate these new nodes without reinitializing the Three.js cameras,
  // SVG pan/zoom state, proof step or mathematical stores.
  observer = new MutationObserver((mutations) => {
    for (const change of mutations) {
      if (change.type === "characterData") updateText(change.target);
      else if (change.type === "attributes") updateAttributes(change.target);
      else for (const node of change.addedNodes) translateTree(node);
    }
  });
  observer.observe(document.body, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ATTRS,
  });
  // E2E coverage hook: verify that no Russian text remains in EN, including
  // content generated after new sliders, proof stages, or model switches.
  window.__lagrangeI18n = Object.freeze({ getLanguage, setLanguage, getMissingTranslations });
}
