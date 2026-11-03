import { paraboloid } from "../math/examples/paraboloid.js";
import { createStore } from "../state/sceneStore.js";
import { createGradientPlot } from "../graphics/svg/gradient.js";
import { createProfile } from "../graphics/svg/profile.js";
import { proofSteps } from "../content/proof.js";
import { math, number, pair, renderMath } from "../ui/format.js";

export function GradientScene(root) {
  const store = createStore(paraboloid);
  const stageNames = proofSteps.map((stage) => stage.title.replace(/^\d+\.\s*/, ""));
  root.innerHTML = `<div class="scene-top"><span class="scene-label">Рис. 2 · Уровни, допустимое направление и производная</span><button data-action="reset">Сбросить</button></div>
  <div class="proof-navigation" aria-label="Последовательность доказательства">
    <div class="proof-progress" role="list" aria-label="Этапы вывода">
      ${stageNames.map((name, i) => `<span role="listitem" data-step-indicator="${i}" ${i === 0 ? 'aria-current="step"' : ""}>${i + 1}. ${name}</span>`).join("")}
    </div>
    <div class="proof-actions">
      <span class="proof-counter" aria-live="polite">Этап <strong data-current-step>1</strong> из 4</span>
      <button data-action="previous-stage" disabled>← Назад</button>
      <button class="primary proof-advance" data-action="next-stage">Следующий этап →</button>
    </div>
  </div>
  <p class="proof-navigation-hint">Нажмите «Следующий этап», чтобы увидеть новые построения на графике и соответствующее объяснение.</p>
  <div class="controls"><div class="slider-row"><label for="gradient-t">Параметр <span data-tex="t"></span></label><input id="gradient-t" type="range" min="0" max="3" step="0.005" value="1"><output for="gradient-t"></output></div><div class="control-buttons"><button data-action="before">До максимума: <span data-tex="t=1"></span></button><button class="primary" data-action="optimum">Точно в максимум: <span data-tex="t=5/3"></span></button><button data-action="after">После максимума: <span data-tex="t=2"></span></button></div><p class="instruction">Точку можно вести по прямой или по профилю. Оси <span data-tex="x,y"></span> имеют одинаковый масштаб; все стрелки используют общий коэффициент длины 0,58.</p></div>
  <div class="scene-layout proof-layout">
    <div class="plane-column"><div class="plane-wrap" data-plane></div><div class="plot-key"><span class="level">Уровни <span data-tex="f(x,y)=c"></span></span><span class="orange">Прямая и <span data-tex="P"></span></span><span class="active-level-label">Сейчас <span data-tex="c=f(P)=h(t)"></span> = <strong data-value="active-level"></strong></span></div><div class="vector-key"><span class="teal" data-legend="1"><span data-tex="\\nabla f"></span> — градиент</span><span class="tangent-key" data-legend="1"><span data-tex="T"></span> — касательный вектор</span><span class="projection" data-legend="2"><span data-tex="\\operatorname{proj}_{T}\\nabla f"></span> — проекция</span><span class="violet" data-legend="3"><span data-tex="\\nabla g"></span> — градиент ограничения</span></div></div>
    <div class="proof-side">
      <div class="profile-panel">
        <div class="plot-title">Высота на допустимой прямой: <span data-tex="h(t)=f(r(t))"></span></div>
        <div data-profile></div>
        <dl class="readouts math-readouts">
          <div class="wide"><dt data-tex="P=r(t)"></dt><dd data-value="point"></dd></div>
          <div><dt>Высота <span data-tex="h(t)"></span></dt><dd data-value="height"></dd></div>
          <div><dt>Производная <span data-tex="h'(t)"></span></dt><dd data-value="derivative"></dd></div>
          <div data-unit hidden><dt>Производная по направлению <span data-tex="D_{\\widehat T}f"></span></dt><dd data-value="unit"></dd></div>
          <div data-angle hidden><dt data-tex="\\angle(\\nabla f,T)"></dt><dd data-value="angle"></dd></div>
          <div class="wide" data-projection hidden><dt data-tex="\\operatorname{proj}_{T}\\nabla f"></dt><dd data-value="projection-vector"></dd></div>
          <div data-projection hidden><dt>Норма проекции <span data-tex="\\|\\operatorname{proj}_{T}\\nabla f\\|"></span></dt><dd data-value="projection-norm"></dd></div>
          <div data-projection hidden><dt>Коэффициент при <span data-tex="T"></span></dt><dd data-value="projection-coefficient"></dd></div>
        </dl>
        <p class="proof-status" aria-live="polite"></p>
      </div>
    </div>
    <div class="proof-copy"><h3></h3><p data-copy></p><div data-formula></div></div>
  </div>
 
  `;
  renderMath(root);

  const plot = createGradientPlot(root.querySelector("[data-plane]"), (t) =>
      store.set({ t }),
    ),
    profile = createProfile(
      root.querySelector("[data-profile]"),
      paraboloid,
      (t) => store.set({ t }),
      { height: 182, tangentLabel: true },
    ),
    slider = root.querySelector("input");
  slider.oninput = (event) => store.set({ t: +event.target.value });
  root.querySelector('[data-action="previous-stage"]').onclick = () =>
    store.set({ step: Math.max(0, store.get().step - 1) });
  root.querySelector('[data-action="next-stage"]').onclick = () =>
    store.set({ step: Math.min(stageNames.length - 1, store.get().step + 1) });
  for (const [key, t] of Object.entries({
    before: 1,
    optimum: 5 / 3,
    after: 2,
  }))
    root.querySelector(`[data-action=${key}]`).onclick = () => store.set({ t });
  root.querySelector("[data-action=reset]").onclick = () => store.reset();

  let renderedStep = -1;
  store.subscribe((state) => {
    plot.update(state);
    profile.update(state);
    slider.value = state.t;
    root.querySelector("output").textContent = number(state.t);
    root.querySelector('[data-value="active-level"]').textContent = number(state.math.height);
    const values = {
      point: pair(state.math.point),
      height: number(state.math.height),
      derivative: number(state.math.derivative),
      unit: number(state.math.unitDerivative),
      angle: `${number((state.math.angle * 180) / Math.PI, 1)}°`,
      "projection-vector": pair(state.math.projection),
      "projection-norm": number(state.math.projectionNorm),
      "projection-coefficient": number(state.math.projectionCoefficient),
    };
    for (const [key, value] of Object.entries(values))
      root.querySelector(`[data-value=${key}]`).textContent = value;
    root.querySelector("[data-unit]").hidden = state.step < 1;
    root.querySelector("[data-angle]").hidden = state.step < 1;
    root
      .querySelectorAll("[data-projection]")
      .forEach((element) => (element.hidden = state.step < 2));
    root
      .querySelectorAll("[data-legend]")
      .forEach(
        (element) => (element.hidden = state.step < +element.dataset.legend),
      );

    const sign = state.math.stationary
      ? "zero"
      : state.math.derivative > 0
        ? "positive"
        : "negative";
    const status = root.querySelector(".proof-status");
    status.dataset.sign = sign;
    status.textContent = state.math.stationary
      ? state.step >= 3
        ? "Касание: h′ = 0, оба градиента нормальны к прямой, λ = 8/3."
        : state.step >= 2
          ? "h′ = 0: проекция исчезла, но ∇f = (8/3; 8/3) не равен нулю."
          : "Высота перестала меняться вдоль выбранного допустимого направления."
      : state.step >= 3
        ? "Здесь h′ ≠ 0, поэтому точка не удовлетворяет условию стационарности."
        : state.step === 0
        ? state.math.derivative > 0
          ? "h′ > 0: высота возрастает при увеличении параметра t."
          : "h′ < 0: высота убывает при увеличении параметра t."
        : state.math.derivative > 0
          ? "h′ > 0 и θ < 90°: движение по T увеличивает высоту."
          : "h′ < 0 и θ > 90°: движение по T уменьшает высоту.";

    if (renderedStep !== state.step) {
      const step = proofSteps[state.step];
      root.querySelector(".proof-copy h3").textContent = step.title;
      root.querySelector("[data-copy]").textContent = step.text;
      root.querySelector("[data-formula]").innerHTML =
        math(step.formula, true) + (step.extra ? math(step.extra, true) : "");
      root.querySelector("[data-current-step]").textContent = state.step + 1;
      root.querySelector('[data-action="previous-stage"]').disabled = state.step === 0;
      const next = root.querySelector('[data-action="next-stage"]');
      next.disabled = state.step === stageNames.length - 1;
      next.textContent = next.disabled
        ? "Условие выведено"
        : `Далее: ${stageNames[state.step + 1]} →`;
      root.querySelectorAll("[data-step-indicator]").forEach((element) => {
        const i = +element.dataset.stepIndicator;
        if (i === state.step) element.setAttribute("aria-current", "step");
        else element.removeAttribute("aria-current");
        element.dataset.completed = String(i < state.step);
      });
      renderedStep = state.step;
    }
    root.dataset.t = state.t;
    root.dataset.step = state.step;
    root.dataset.derivative = state.math.derivative;
    root.dataset.angle = state.math.angle;
    root.dataset.level = state.math.height;
    root.dataset.projectionCoefficient = state.math.projectionCoefficient;
  });
  return store;
}
