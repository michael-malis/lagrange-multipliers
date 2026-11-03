import { paraboloid } from "../math/examples/paraboloid.js";
import { createStore } from "../state/sceneStore.js";
import { createGradientPlot } from "../graphics/svg/gradient.js";
import { createProfile } from "../graphics/svg/profile.js";
import { proofSteps } from "../content/proof.js";
import { math, number, pair, renderMath } from "../ui/format.js";

export function GradientScene(root) {
  const store = createStore(paraboloid);
  root.innerHTML = `<div class="scene-top"><span class="scene-label">Рис. 2 · Уровни, допустимое направление и производная</span><button data-action="reset">Сбросить</button></div>
  <div class="proof-steps" role="group" aria-label="Шаги геометрического вывода">${[
    "1. Знак изменения",
    "2. Правило цепочки",
    "3. Проекция",
    "4. Нормаль и вывод",
  ]
    .map(
      (name, i) =>
        `<button data-step="${i}" aria-pressed="${i === 0}">${name}</button>`,
    )
    .join("")}</div>
  <div class="controls"><div class="slider-row"><label for="gradient-t">Параметр <span data-tex="t"></span></label><input id="gradient-t" type="range" min="0" max="3" step="0.005" value="1"><output for="gradient-t"></output></div><div class="control-buttons"><button data-action="before">До максимума: <span data-tex="t=1"></span></button><button class="primary" data-action="optimum">Точно в максимум: <span data-tex="t=5/3"></span></button><button data-action="after">После максимума: <span data-tex="t=2"></span></button></div><p class="instruction">Точку можно вести по прямой или по профилю. Оси <span data-tex="x,y"></span> имеют одинаковый масштаб; все стрелки используют общий коэффициент длины 0,58.</p></div>
  <div class="scene-layout proof-layout">
    <div class="plane-column"><div class="plane-wrap" data-plane></div><div class="plot-key"><span class="level">Линии уровня <span data-tex="f(x,y)=c"></span></span><span class="orange">Допустимая прямая и <span data-tex="P"></span></span><span class="active-level-label">Текущий уровень: <span data-tex="c=f(P)=h(t)"></span> = <strong data-value="active-level"></strong></span></div><div class="vector-key"><span class="teal" data-legend="1"><span data-tex="\\nabla f"></span> — градиент</span><span class="tangent-key" data-legend="1"><span data-tex="T"></span> — касательная</span><span class="projection" data-legend="2"><span data-tex="\\operatorname{proj}_{T}\\nabla f"></span> — проекция</span><span class="violet" data-legend="3"><span data-tex="\\nabla g"></span> — нормаль</span></div></div>
    <div class="proof-side">
      <div class="profile-panel">
        <div class="plot-title">Один уровень в трёх записях: <span data-tex="c=f(P)=h(t)"></span></div>
        <div data-profile></div>
        <dl class="readouts math-readouts">
          <div class="wide"><dt data-tex="P=r(t)"></dt><dd data-value="point"></dd></div>
          <div><dt data-tex="c=f(P)=h(t)"></dt><dd data-value="height"></dd></div>
          <div><dt data-tex="h'(t)=\\nabla f\\cdot T"></dt><dd data-value="derivative"></dd></div>
          <div data-unit hidden><dt data-tex="D_{\\widehat T}f"></dt><dd data-value="unit"></dd></div>
          <div data-angle hidden><dt data-tex="\\angle(\\nabla f,T)"></dt><dd data-value="angle"></dd></div>
          <div class="wide" data-projection hidden><dt data-tex="\\operatorname{proj}_{T}\\nabla f"></dt><dd data-value="projection-vector"></dd></div>
          <div data-projection hidden><dt data-tex="\\|\\operatorname{proj}_{T}\\nabla f\\|"></dt><dd data-value="projection-norm"></dd></div>
          <div data-projection hidden><dt>Знаковый коэффициент при <span data-tex="T"></span></dt><dd data-value="projection-coefficient"></dd></div>
        </dl>
        <p class="proof-status" aria-live="polite"></p>
      </div>
      <div class="proof-copy"><h3></h3><p data-copy></p><div data-formula></div></div>
    </div>
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
        : state.math.derivative > 0
          ? "h′ > 0 и θ < 90°: движение по T увеличивает высоту."
          : "h′ < 0 и θ > 90°: движение по T уменьшает высоту.";

    if (renderedStep !== state.step) {
      const step = proofSteps[state.step];
      root.querySelector(".proof-copy h3").textContent = step.title;
      root.querySelector("[data-copy]").textContent = step.text;
      root.querySelector("[data-formula]").innerHTML =
        math(step.formula, true) + (step.extra ? math(step.extra, true) : "");
      root
        .querySelectorAll("[data-step]")
        .forEach((element) =>
          element.setAttribute(
            "aria-pressed",
            +element.dataset.step === state.step,
          ),
        );
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
