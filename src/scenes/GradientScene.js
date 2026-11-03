import { paraboloid } from "../math/examples/paraboloid.js";
import { createStore } from "../state/sceneStore.js";
import { createGradientPlot } from "../graphics/svg/gradient.js";
import { createProfile } from "../graphics/svg/profile.js";
import { proofSteps } from "../content/proof.js";
import { math, number, pair } from "../ui/format.js";
export function GradientScene(root) {
  const store = createStore(paraboloid);
  root.innerHTML = `<div class="scene-top"><span class="scene-label">Рис. 2 · Допустимое изменение</span><button data-action="reset">Сбросить сцену</button></div><div class="proof-steps" role="group" aria-label="Шаги геометрического вывода">${["1. Изменение", "2. Градиент", "3. Проекция", "4. Нормаль", "5. Условие"].map((name, i) => `<button data-step="${i}" aria-pressed="${i === 0}">${name}</button>`).join("")}</div><div class="scene-layout proof-layout"><div class="plane-wrap" data-plane></div><div class="profile-panel"><div class="plot-title">Тот же профиль h(t)</div><div data-profile></div><dl class="readouts"><div class="wide"><dt>Точка P</dt><dd data-value="point"></dd></div><div><dt>h′(t) = ∇f · T</dt><dd data-value="derivative"></dd></div><div><dt>Высота h(t)</dt><dd data-value="height"></dd></div><div data-unit hidden><dt>D<sub>T̂</sub> f = h′/√2</dt><dd data-value="unit"></dd></div><div data-projection hidden><dt>‖proj<sub>T</sub> ∇f‖</dt><dd data-value="projection"></dd></div></dl><p class="proof-status" aria-live="polite"></p></div></div><div class="legend"><span class="orange">Ограничение</span><span class="teal" data-legend="1">Градиент ∇f</span><span data-legend="1">Касательная T</span><span class="teal" data-legend="2">Проекция на T · толстая линия</span><span class="violet" data-legend="3">Градиент ∇g</span></div><div class="controls"><div class="slider-row"><label for="gradient-t">Параметр t</label><input id="gradient-t" type="range" min="0" max="3" step="0.005" value="1"><output for="gradient-t"></output></div><div class="control-buttons"><button data-action="before">До: t = 1</button><button data-action="optimum">Точно: t = 5/3</button><button data-action="after">После: t = 2</button></div><p class="instruction">Точку можно перетаскивать по прямой или профилю. Масштабы осей равны. Все векторы показаны в одном масштабе: 0,65 единицы оси на единицу вектора.</p></div><div class="proof-copy"><h3></h3><p data-copy></p><div data-formula></div><div class="proof-next"><span class="muted small sans" data-step-counter></span><button class="primary" data-action="next">Следующий шаг →</button></div></div>`;
  root
    .querySelector(".profile-panel")
    .append(root.querySelector(".proof-copy"));
  const projectionReadout = root.querySelector("[data-projection]");
  const plot = createGradientPlot(root.querySelector("[data-plane]"), (t) =>
    store.set({ t }),
  );
  const profile = createProfile(
    root.querySelector("[data-profile]"),
    paraboloid,
    (t) => store.set({ t }),
    { height: 170 },
  );
  root.querySelector("input").oninput = (e) =>
    store.set({ t: +e.target.value });
  root
    .querySelectorAll("[data-step]")
    .forEach(
      (button) =>
        (button.onclick = () => store.set({ step: +button.dataset.step })),
    );
  for (const [key, t] of Object.entries({
    before: 1,
    optimum: 5 / 3,
    after: 2,
  }))
    root.querySelector(`[data-action=${key}]`).onclick = () => store.set({ t });
  root.querySelector("[data-action=reset]").onclick = () => store.reset();
  root.querySelector("[data-action=next]").onclick = () =>
    store.set({ step: Math.min(4, store.get().step + 1) });
  let renderedStep = -1;
  store.subscribe((s) => {
    plot.update(s);
    profile.update(s);
    root.querySelector("input").value = s.t;
    root.querySelector("output").textContent = number(s.t);
    const values = {
      point: pair(s.math.point),
      derivative: number(s.math.derivative),
      height: number(s.math.height),
      unit: number(s.math.unitDerivative),
      projection: number(Math.hypot(...s.math.projection)),
    };
    for (const [k, v] of Object.entries(values))
      root.querySelector(`[data-value=${k}]`).textContent = v;
    root.querySelector("[data-unit]").hidden = s.step < 1;
    projectionReadout.hidden = s.step < 2;
    root.querySelector(
      "[data-value=derivative]",
    ).previousElementSibling.textContent =
      s.step >= 1 ? "h′(t) = ∇f · T" : "Производная h′(t)";
    root
      .querySelectorAll("[data-legend]")
      .forEach((el) => (el.hidden = s.step < +el.dataset.legend));
    root.querySelector(".proof-status").textContent = s.math.stationary
      ? s.step >= 4
        ? "Здесь условие выполнено: λ = 8/3."
        : s.step >= 2
          ? "Проекция равна нулю. Градиент ненулевой."
          : "Высота перестала расти: h′ = 0."
      : s.step >= 4
        ? "Здесь h′ ≠ 0: условие Лагранжа не выполнено."
        : s.math.derivative > 0
          ? "h′ > 0: движение по T увеличивает высоту."
          : "h′ < 0: движение по T уменьшает высоту.";
    if (renderedStep !== s.step) {
      const step = proofSteps[s.step];
      root.querySelector(".proof-copy h3").textContent = step.title;
      root.querySelector("[data-copy]").textContent = step.text;
      root.querySelector("[data-formula]").innerHTML =
        math(step.formula, true) + (step.extra ? math(step.extra, true) : "");
      root
        .querySelectorAll("[data-step]")
        .forEach((el) =>
          el.setAttribute("aria-pressed", +el.dataset.step === s.step),
        );
      root.querySelector("[data-step-counter]").textContent =
        `Шаг ${s.step + 1} из 5`;
      root.querySelector("[data-action=next]").disabled = s.step === 4;
      renderedStep = s.step;
    }
    root.dataset.t = s.t;
    root.dataset.step = s.step;
    root.dataset.derivative = s.math.derivative;
  });
  return store;
}
