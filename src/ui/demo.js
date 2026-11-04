
const chapters = [
  { id: "surface", label: "01 · Допустимая кривая", question: "Почему максимум на прямой отличается от максимума на плоскости?" },
  { id: "geometry", label: "02 · Градиенты и касание", question: "Почему в условном максимуме касательная проекция равна нулю?" },
  { id: "cylinder", label: "03 · Необходимость и достаточность", question: "Может ли условие Лагранжа выполняться без экстремума?" },
];

export function initDemo() {
  const header = document.querySelector(".masthead");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "demo-toggle";
  toggle.textContent = "Демонстрация";
  toggle.setAttribute("aria-pressed", "false");
  toggle.setAttribute("aria-label", "Переключить режим чтения и демонстрации");
  header.append(toggle);

  const toolbar = document.createElement("div");
  toolbar.className = "demo-toolbar";
  toolbar.hidden = true;
  toolbar.innerHTML = `<button type="button" data-demo-prev>← Назад</button>
    <div class="demo-location"><span class="demo-chapter" aria-live="polite"></span><span class="demo-question"></span></div>
    <button type="button" class="primary" data-demo-next>Далее →</button>
    <details class="demo-help"><summary aria-label="Клавиатурные команды демонстрации">Клавиши</summary><span>← / → — этапы · 1–3 — точки · R — камера · Esc — чтение</span></details>`;
  header.insertAdjacentElement("afterend", toolbar);
  let chapter = 0;
  let mode = "read";
  const sceneFor = () => document.querySelector("#scene-" + ["one", "two", "three"][chapter]);
  const setChapter = (n) => {
    chapter = Math.max(0, Math.min(chapters.length - 1, n));
    chapters.forEach((entry, i) => {
      document.getElementById(entry.id).dataset.demoActive = String(i === chapter);
    });
    toolbar.querySelector(".demo-chapter").textContent =
      `${chapter + 1} / ${chapters.length}  ·  ${chapters[chapter].label}`;
    toolbar.querySelector(".demo-question").textContent =
      chapters[chapter].question;
    toolbar.querySelector("[data-demo-prev]").disabled = chapter === 0;
    toolbar.querySelector("[data-demo-next]").disabled = chapter === chapters.length - 1;
    if (mode === "demo") window.scrollTo({ top: 0, behavior: "instant" });
  };
  const proofCopy = document.querySelector("#scene-two .proof-copy");
  const proofControls = document.querySelector("#scene-two .controls");
  const proofSide = document.querySelector("#scene-two .proof-side");
  const syncProofPosition = () => {
    if (mode === "demo" && window.innerWidth >= 900) proofSide.prepend(proofCopy);
    else proofControls.before(proofCopy);
  };
  const setMode = (next) => {
    mode = next;
    document.body.dataset.mode = next;
    if (next === "demo") toolbar.append(toggle);
    else header.append(toggle);
    // Reuse the same proof DOM and move it beside the plot only when there is room.
    syncProofPosition();
    toggle.setAttribute("aria-pressed", String(next === "demo"));
    toggle.textContent = next === "demo" ? "Вернуться к чтению" : "Демонстрация";
    toolbar.hidden = next !== "demo";
    if (next === "demo") setChapter(chapter);
    else {
      const dest = document.getElementById(chapters[chapter].id);
      dest?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  };
  toggle.onclick = () => setMode(mode === "demo" ? "read" : "demo");
  window.addEventListener("resize", syncProofPosition);
  document.querySelectorAll("a[data-view]").forEach((link) => link.addEventListener("click", (event) => {
    if (mode !== "demo") return;
    event.preventDefault();
    setChapter(chapters.findIndex((c) => c.id === link.dataset.view));
  }));
  toolbar.querySelector("[data-demo-prev]").onclick = () => setChapter(chapter - 1);
  toolbar.querySelector("[data-demo-next]").onclick = () => setChapter(chapter + 1);

  window.addEventListener("keydown", (event) => {
    if (mode !== "demo" || event.altKey || event.ctrlKey || event.metaKey) return;
    const tag = event.target?.tagName?.toLowerCase();
    if (["input", "textarea", "select"].includes(tag) || event.target?.isContentEditable) return;
    if (event.key === "Escape") { event.preventDefault(); setMode("read"); return; }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const scene = sceneFor();
      const nextStep = chapter === 1 && scene.querySelector('[data-action="next-stage"]:not([hidden])');
      if (nextStep) nextStep.click(); else setChapter(chapter + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const scene = sceneFor();
      const back = chapter === 1 && scene.querySelector('[data-action="previous-stage"]:not(:disabled)');
      if (back) back.click(); else setChapter(chapter - 1);
    }
    if (event.key.toLowerCase() === "r") {
      const scene = sceneFor();
      (scene.querySelector('[data-action="camera"]') || scene.querySelector('[data-action="reset-view"]'))?.click();
    }
    if (["1", "2", "3"].includes(event.key)) {
      const action = [
        ["plane", "optimum", "camera"],
        ["before", "optimum", "after"],
        ["local", "global", "minimum-plus"],
      ][chapter][Number(event.key) - 1];
      sceneFor().querySelector(`[data-action="${action}"]`)?.click();
    }
  });
  setChapter(0);
}
