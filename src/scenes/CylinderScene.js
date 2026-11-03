import { cylinder } from "../math/examples/cylinder.js";
import { counterexample } from "../math/examples/counterexample.js";
import { createStore } from "../state/sceneStore.js";
import { createSurface } from "../graphics/three/surface.js";
import { createProfile } from "../graphics/svg/profile.js";
import { createCircle } from "../graphics/svg/circle.js";
import { math, number, pair, renderMath } from "../ui/format.js";

export function CylinderScene(root) {
  const store = createStore(cylinder, { vectors: false });
  root.innerHTML = `<div class="scene-top"><span class="scene-label">Рис. 3 · Замкнутая траектория и четыре кандидата</span><button data-action="reset">Сбросить</button></div>
  <div class="controls"><div class="slider-row"><label for="cylinder-t">Угол <span data-tex="t"></span></label><input id="cylinder-t" type="range" min="0" max="6.283185307179586" step="0.005" value="3.141592653589793"><output for="cylinder-t"></output></div><div class="control-buttons"><button data-action="local">Локальный максимум · 0</button><button class="primary" data-action="global">Глобальный максимум · 2</button><button data-action="candidates" aria-pressed="false">Все кандидаты</button><button data-action="vectors" aria-pressed="false">Градиенты</button><button data-action="camera">Исходный ракурс</button></div><p class="instruction">Точка движется только по допустимой окружности. Профиль, пространственная точка и плоская проекция обновляются из одного параметра.</p></div>
  <div class="scene-layout"><div class="world"><div class="world-labels"><span class="blue" data-surface-label>z = x + x² − y²</span><span class="orange">x² + y² = 1</span></div><div class="world-note">Мышь — поворот · колесо — масштаб<br>Оси x, y, z показаны в одном масштабе</div></div><div class="profile-panel"><div class="plot-title" data-profile-title></div><div data-profile></div><div class="circle-readouts"><div data-circle></div><dl class="readouts math-readouts"><div class="wide"><dt data-tex="P=r(t)"></dt><dd data-value="point"></dd></div><div><dt data-tex="h(t)"></dt><dd data-value="height"></dd></div><div><dt data-tex="h'(t)"></dt><dd data-value="derivative"></dd></div><div class="wide"><dt data-tex="\\lambda\\ \\text{в стационарной точке}"></dt><dd data-value="lambda"></dd></div></dl></div><p class="proof-status" aria-live="polite"></p></div></div>
  <div class="legend"><span class="blue">Поверхность <span data-tex="f"></span></span><span class="orange">Цилиндр, пересечение и окружность</span><span class="teal" data-vector-legend hidden>Градиент <span data-tex="\\nabla f"></span></span><span class="violet" data-vector-legend hidden>Градиент <span data-tex="\\nabla g"></span></span></div>
  
  <div class="cylinder-study"><h3>Классификация и проверка границ метода</h3><div class="study-toolbar"><div class="study-mode-group"><span class="study-label">Выбор функции</span><div class="control-buttons" role="group" aria-label="Выбор функции"><button data-model="cylinder" aria-pressed="true">Основная функция</button><button data-model="counterexample" aria-pressed="false">Стационарность без экстремума</button></div></div><div class="study-point-group"><span class="study-label">Точки выбранной функции</span><div class="control-buttons" role="group" aria-label="Точки выбранной функции"><button data-action="minimum-plus">Минимум · y &gt; 0</button><button data-action="minimum-minus">Минимум · y &lt; 0</button></div></div></div><p class="instruction">Для стрелок <span data-tex="\\nabla f"></span> и <span data-tex="\\nabla g"></span> используется один масштаб: 0,38 единицы оси на единицу вектора. Нулевой градиент стрелкой не изображается.</p><div data-analysis></div></div>`;
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
  root.querySelector("[data-action=local]").onclick = () => {
    if (store.get().model !== cylinder) store.useModel(cylinder);
    store.set({ t: Math.PI });
  };
  root.querySelector("[data-action=global]").onclick = () => {
    if (store.get().model !== cylinder) store.useModel(cylinder);
    store.set({ t: 0 });
  };
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
  for (const [id, model] of Object.entries({ cylinder, counterexample }))
    root.querySelector(`[data-model=${id}]`).onclick = () =>
      store.useModel(model);
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
      root.querySelector("[data-surface-label]").textContent = isMain
        ? "z = x + x² − y²"
        : "z = y³";
      root.querySelector("[data-profile-title]").innerHTML = isMain
        ? `Профиль ${math("h(t)=\\cos t+\\cos2t")}`
        : `Контрпример ${math("h(t)=\\sin^3t")}`;
      root
        .querySelectorAll("[data-model]")
        .forEach((element) =>
          element.setAttribute(
            "aria-pressed",
            element.dataset.model === state.model.id,
          ),
        );
      root.querySelector("[data-action=minimum-plus]").textContent = isMain
        ? "Минимум · y > 0"
        : "Стационарная точка · t = 0";
      root.querySelector("[data-action=minimum-minus]").textContent = isMain
        ? "Минимум · y < 0"
        : "Максимум · y = 1";
      root.querySelector("[data-analysis]").innerHTML = isMain
        ? `${math("h'(t)=-\\sin t(1+4\\cos t)=0", true)}<p>Условие распадается на <span class="math-inline">${math("\\sin t=0")}</span> и <span class="math-inline">${math("\\cos t=-1/4")}</span>. Полный список кандидатов:</p><div class="table-scroll"><table><thead><tr><th>Точка</th><th>f</th><th>λ</th><th>Классификация</th></tr></thead><tbody><tr><td>(1; 0)</td><td>2</td><td>3/2</td><td>Глобальный максимум</td></tr><tr><td>(−1; 0)</td><td>0</td><td>1/2</td><td>Локальный, не глобальный максимум</td></tr><tr><td>(−1/4; √15/4)</td><td>−9/8</td><td>−1</td><td>Глобальный минимум</td></tr><tr><td>(−1/4; −√15/4)</td><td>−9/8</td><td>−1</td><td>Глобальный минимум</td></tr></tbody></table></div><p>В минимумах <span class="math-inline">${math("\\nabla f=-\\nabla g")}</span>: множитель отрицателен, поэтому градиенты противоположны.</p>`
        : `${math("h(t)=\\sin^3t,\\qquad h'(0)=0,\\qquad \\nabla f(1,0)=0,\\qquad \\lambda=0", true)}<p>Проведите точку через правый край окружности. Значения перед <span class="math-inline">${math("2\\pi")}</span> отрицательны, а сразу после нуля положительны. Стационарность выполнена, но локального экстремума нет.</p>`;
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
