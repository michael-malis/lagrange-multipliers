import { cylinder } from "../math/examples/cylinder.js";
import { counterexample } from "../math/examples/counterexample.js";
import { createStore } from "../state/sceneStore.js";
import { createSurface } from "../graphics/three/surface.js";
import { createProfile } from "../graphics/svg/profile.js";
import { createCircle } from "../graphics/svg/circle.js";
import { math, number, pair, renderMath } from "../ui/format.js";


function counterexampleInset() {
  // Local enlargement: h(t) = sin^3(t), t in [-0.5, 0.5].
  const path = Array.from({ length: 161 }, (_, i) => {
    const t = -0.5 + i / 160;
    const x = 30 + (t + 0.5) * 300;
    const y = 95 - 460 * Math.sin(t) ** 3;
    return `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  return `<figure class="counterexample-inset">
    <svg role="img" aria-label="Увеличенный профиль sin в кубе около нуля: слева значения отрицательны, справа положительны, касательная горизонтальна" viewBox="0 0 360 192">
      <line x1="30" y1="95" x2="330" y2="95" stroke="#929baa" stroke-width="1.5"/>
      <line x1="180" y1="22" x2="180" y2="163" stroke="#929baa" stroke-width="1.2"/>
      <path d="${path}" fill="none" stroke="#e3a15c" stroke-width="3"/>
      <line x1="140" y1="95" x2="220" y2="95" stroke="#47e1c2" stroke-width="3" stroke-dasharray="7 4"/>
      <circle cx="180" cy="95" r="5" fill="#e3a15c" stroke="#141b26" stroke-width="2"/>
      <g fill="#d9e5ed" font-size="14" font-family="sans-serif">
        <text x="31" y="184">−0,5</text><text x="176" y="184">0</text><text x="307" y="184">0,5</text>
        <text x="37" y="140">h &lt; 0</text><text x="252" y="51">h &gt; 0</text>
        <text x="194" y="86">h′(0) = 0</text>
      </g>
    </svg>
    <figcaption>Около t = 0 значения меняют знак. Стационарная точка, не экстремум.</figcaption>
  </figure>`;
}
function renderCriticalPoints() {
  // Descriptive identifiers distinguish global and local extrema; an
  // undifferentiated P* would incorrectly suggest that all are optima.
  const rows = [
    { name: String.raw`P_{\max}`, point: String.raw`(1,0)`, height: "2", lambda: String.raw`\frac32`, kind: "Глобальный максимум" },
    { name: String.raw`P_{\mathrm{loc.max}}`, point: String.raw`(-1,0)`, height: "0", lambda: String.raw`\frac12`, kind: "Локальный, не глобальный максимум" },
    { name: String.raw`P_{\min}^{+}`, point: String.raw`\left(-\frac14,\frac{\sqrt{15}}4\right)`, height: String.raw`-\frac98`, lambda: "-1", kind: "Глобальный минимум" },
    { name: String.raw`P_{\min}^{-}`, point: String.raw`\left(-\frac14,-\frac{\sqrt{15}}4\right)`, height: String.raw`-\frac98`, lambda: "-1", kind: "Глобальный минимум" },
  ];
  return `
    ${math(String.raw`h'(t)=-\sin t(1+4\cos t)=0`, true)}
    <p>Условие распадается на ${math(String.raw`\sin t=0`)} и ${math(String.raw`\cos t=-\frac14`)}. Четыре кандидата:</p>
    <div class="table-scroll"><table>
      <thead><tr><th>Обозначение</th><th>Точка</th><th>${math("f")}</th><th>${math(String.raw`\lambda`)}</th><th>Тип</th></tr></thead>
      <tbody>${rows.map(c => `<tr><td>${math(c.name)}</td><td>${math(c.point)}</td><td>${math(c.height)}</td><td>${math(c.lambda)}</td><td>${c.kind}</td></tr>`).join("")}</tbody>
    </table></div>
    <p>В минимумах ${math(String.raw`\nabla f=-\nabla g`)}: отрицательный множитель означает противоположное направление градиентов.</p>
  `;
}

export function CylinderScene(root) {
  const store = createStore(cylinder, { vectors: false });
  root.innerHTML = `<div class="scene-top"><span class="scene-label">Рис. 3 · Экстремумы на окружности</span><button data-action="reset">Сбросить</button></div>
  <div class="controls"><div class="slider-row"><label for="cylinder-t">Угол <span data-tex="t"></span></label><input id="cylinder-t" type="range" min="0" max="6.283185307179586" step="0.005" value="3.141592653589793"><output for="cylinder-t"></output></div><div class="cylinder-actions"><div class="cylinder-presets"><span class="controls-label">Положение точки</span><div class="control-buttons" role="group" aria-label="Характерные точки на окружности"><button data-action="local">Локальный максимум · 0</button><button data-action="global">Глобальный максимум · 2</button></div></div><div class="cylinder-view-options"><span class="controls-label">Что показать на графике</span><div class="control-buttons"><button data-action="candidates" aria-pressed="false">Стационарные точки</button><button data-action="vectors" aria-pressed="false">Градиенты</button><button data-action="camera">Вернуть ракурс</button></div></div></div><p class="instruction">Точка движется по окружности. Её положение на поверхности, на окружности и на графике высоты изменяется одновременно.</p><div class="scene-function-picker"><div class="study-mode-group"><span class="study-label">Дополнительный опыт: достаточно ли условия <span data-tex="h\'(t)=0"></span> для экстремума?</span><button data-action="switch-model" aria-pressed="false">Проверить контрпример: <span data-tex="f(x,y)=x^2+y^2-1+y^3"></span></button></div><p class="instruction">Сравните две функции на одной и той же окружности. Изменится поверхность и график высоты, но не ограничение.</p></div><p class="model-context" data-model-context>Исходная функция: <span data-tex="f(x,y)=x+x^2-y^2"></span> при <span data-tex="x^2+y^2=1"></span>.</p></div>
  <div class="scene-layout"><div class="world"><div class="world-labels"><span class="blue" data-surface-label>z = x + x² − y²</span><span class="orange">x² + y² = 1</span></div><div class="world-note">Мышь — поворот · колесо — масштаб<br>Оси x, y, z показаны в одном масштабе</div></div><div class="profile-panel"><div class="plot-title" data-profile-title></div><div data-profile></div><div class="circle-readouts"><div data-circle></div><dl class="readouts math-readouts"><div class="wide"><dt data-tex="P=r(t)"></dt><dd data-value="point"></dd></div><div><dt data-tex="h(t)"></dt><dd data-value="height"></dd></div><div><dt data-tex="h'(t)"></dt><dd data-value="derivative"></dd></div><div class="wide"><dt data-tex="\\lambda\\ \\text{в стационарной точке}"></dt><dd data-value="lambda"></dd></div></dl></div><p class="proof-status" aria-live="polite"></p></div></div>
  <div class="legend"><span class="blue">Поверхность <span data-tex="f"></span></span><span class="orange">Цилиндр, пересечение и окружность</span><span class="teal" data-vector-legend hidden>Градиент <span data-tex="\\nabla f"></span></span><span class="violet" data-vector-legend hidden>Градиент <span data-tex="\\nabla g"></span></span></div>
  
  <div class="cylinder-study"><h3>Почему условие ещё не гарантирует экстремум?</h3><p class="study-context">Заменим только <em>целевую функцию</em>; ограничение остаётся <span data-tex="x^2+y^2=1"></span>. Посмотрим, что произойдёт со стационарной точкой. При переключении изменятся поверхность, график высоты и вычисления.</p><div class="study-toolbar"><div class="study-point-group"><span class="study-label">Выберите точку на окружности</span><div class="control-buttons" role="group" aria-label="Точки выбранной функции"><button data-action="minimum-plus">Минимум · y &gt; 0</button><button data-action="minimum-minus">Минимум · y &lt; 0</button></div></div></div><p class="instruction">Для стрелок <span data-tex="\\nabla f"></span> и <span data-tex="\\nabla g"></span> используется один масштаб: 0,38 единицы оси на единицу вектора. Нулевой градиент стрелкой не изображается.</p><div data-analysis></div></div>`;
  renderMath(root);

  const world = createSurface(root.querySelector(".world"), cylinder),
    profile = createProfile(
      root.querySelector("[data-profile]"),
      cylinder,
      (t) => store.set({ t }),
      { yRange: [-1.5, 2.5], height: 190 },
    ),
    circle = createCircle(root.querySelector("[data-circle]"), (t) =>
      store.set({ t }),
    ),
    slider = root.querySelector("input");
  slider.oninput = () => store.set({ t: +slider.value });
  root.querySelector("[data-action=local]").onclick = () =>
    store.set({ t: store.get().model === cylinder ? Math.PI : 0 });
  root.querySelector("[data-action=global]").onclick = () =>
    store.set({ t: store.get().model === cylinder ? 0 : Math.PI / 2 });
  root.querySelector("[data-action=candidates]").onclick = () =>
    store.set({ candidates: !store.get().candidates });
  root.querySelector("[data-action=vectors]").onclick = () =>
    store.set({ vectors: !store.get().vectors });
  root.querySelector("[data-action=camera]").onclick = () =>
    world.resetCamera();
  root.querySelector("[data-action=reset]").onclick = () => {
    store.reset();
    world.resetCamera();
  };
  root.querySelector('[data-action="switch-model"]').onclick = () => {
    const alternate = store.get().model !== counterexample;
    store.useModel(alternate ? counterexample : cylinder);
    store.set({ candidates: alternate, vectors: alternate, t: alternate ? 0 : Math.PI });
  };
  root.querySelector("[data-action=minimum-plus]").onclick = () =>
    store.set({
      t: store.get().model === cylinder ? Math.acos(-0.25) : 0,
      candidates: true,
      vectors: true,
    });
  root.querySelector("[data-action=minimum-minus]").onclick = () =>
    store.set({
      t:
        store.get().model === cylinder
          ? 2 * Math.PI - Math.acos(-0.25)
          : Math.PI / 2,
      candidates: true,
      vectors: true,
    });

  let renderedModel;
  store.subscribe((state) => {
    world.update(state);
    profile.update(state, { candidates: state.candidates });
    circle.update(state, { gradients: state.vectors });
    slider.value = state.t;
    root.querySelector("output").textContent = number(state.t);
    for (const [key, value] of Object.entries({
      point: pair(state.math.point),
      height: number(state.math.height),
      derivative: number(state.math.derivative),
      lambda: state.math.lambda === null ? "—" : number(state.math.lambda),
    }))
      root.querySelector(`[data-value=${key}]`).textContent = value;
    root
      .querySelector("[data-action=candidates]")
      .setAttribute("aria-pressed", state.candidates);
    root
      .querySelector("[data-action=vectors]")
      .setAttribute("aria-pressed", state.vectors);
    root
      .querySelectorAll("[data-vector-legend]")
      .forEach((element) => (element.hidden = !state.vectors));
    const critical = state.model.critical.find(
      (candidate) => Math.abs(candidate.t - state.t) < 1e-7,
    );
    root.querySelector(".proof-status").textContent = critical
      ? `${critical.kind}. Высота ${number(critical.height)}.`
      : "Точка допустима, но производная вдоль окружности не равна нулю.";

    if (renderedModel !== state.model) {
      const isMain = state.model === cylinder;
      root.querySelector("[data-model-context]").innerHTML = isMain
        ? `Основная функция: ${math("f(x,y)=x+x^2-y^2")} на окружности ${math("x^2+y^2=1")}.`
        : `Дополнительный пример: ${math("f(x,y)=x^2+y^2-1+y^3")} на той же окружности ${math("x^2+y^2=1")}. Здесь ${math("h\'(0)=0")}, но экстремума нет: высота меняет знак при прохождении точки ${math("(1,0)")}.`;
      root.querySelector("[data-surface-label]").textContent = isMain
        ? "z = x + x² − y²"
        : "z = x² + y² − 1 + y³";
      root.querySelector("[data-profile-title]").innerHTML = isMain
        ? `Профиль ${math("h(t)=\\cos t+\\cos2t")}`
        : `Высота для другой функции ${math("h(t)=\\sin^3t")}`;
      const modelSwitch = root.querySelector('[data-action="switch-model"]');
      modelSwitch.setAttribute("aria-pressed", String(!isMain));
      modelSwitch.innerHTML = isMain
        ? `Проверить контрпример: ${math("f(x,y)=x^2+y^2-1+y^3")}`
        : "Вернуться к исходной функции";
      root.querySelector("[data-action=local]").textContent = isMain
        ? "Локальный максимум · 0"
        : "Стационарная точка без экстремума";
      root.querySelector("[data-action=global]").textContent = isMain
        ? "Глобальный максимум · 2"
        : "Глобальный максимум · 1";
      root.querySelector(".study-point-group").hidden = !isMain;
      root.querySelector("[data-action=minimum-plus]").textContent = isMain
        ? "Минимум · y > 0"
        : "Стационарная точка · t = 0";
      root.querySelector("[data-action=minimum-minus]").textContent = isMain
        ? "Минимум · y < 0"
        : "Максимум · y = 1";
      root.querySelector("[data-analysis]").innerHTML = isMain
        ? renderCriticalPoints()
        : `${math("h(t)=\\sin^3t,\\qquad h'(0)=0,\\qquad \\nabla f(1,0)=(2,0)=\\nabla g(1,0),\\qquad \\lambda=1", true)}<p>Окружность та же, но функция другая. При ${math(String.raw` + "`t<0`" + `)} вблизи нуля высота отрицательна, а при ${math(String.raw` + "`t>0`" + `)} — положительна. Хотя градиент ненулевой и условие Лагранжа выполнено при ${math(String.raw` + "`\lambda=1`" + `)}, здесь нет ни максимума, ни минимума. <strong>Стационарная точка, не экстремум.</strong></p>` + counterexampleInset();
      renderedModel = state.model;
    }
    root.dataset.t = state.t;
    root.dataset.height = state.math.height;
    root.dataset.model = state.model.id;
    root.dataset.lambda =
      state.math.lambda === null ? "none" : state.math.lambda;
    root.dataset.vectors = state.vectors;
  });
  return store;
}
