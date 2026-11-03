import { cylinder } from "../math/examples/cylinder.js";
import { counterexample } from "../math/examples/counterexample.js";
import { createStore } from "../state/sceneStore.js";
import { createSurface } from "../graphics/three/surface.js";
import { createProfile } from "../graphics/svg/profile.js";
import { createCircle } from "../graphics/svg/circle.js";
import { math, number, pair, renderMath } from "../ui/format.js";

export function CylinderScene(root) {
  const store = createStore(cylinder, { vectors: false });
  root.innerHTML = `<div class="scene-top"><span class="scene-label">Рис. 3 · Экстремумы на окружности</span><button data-action="reset">Сбросить</button></div>
  <div class="controls"><div class="slider-row"><label for="cylinder-t">Угол <span data-tex="t"></span></label><input id="cylinder-t" type="range" min="0" max="6.283185307179586" step="0.005" value="3.141592653589793"><output for="cylinder-t"></output></div><div class="cylinder-actions"><div class="cylinder-presets"><span class="controls-label">Положение точки</span><div class="control-buttons" role="group" aria-label="Характерные точки на окружности"><button data-action="local">Локальный максимум · 0</button><button data-action="global">Глобальный максимум · 2</button></div></div><div class="cylinder-view-options"><span class="controls-label">Что показать на графике</span><div class="control-buttons"><button data-action="candidates" aria-pressed="false">Стационарные точки</button><button data-action="vectors" aria-pressed="false">Градиенты</button><button data-action="camera">Вернуть ракурс</button></div></div></div><p class="instruction">Точка движется по окружности. Её положение на поверхности, на окружности и на графике высоты изменяется одновременно.</p><div class="scene-function-picker"><div class="study-mode-group"><span class="study-label">Дополнительный опыт: достаточно ли условия <span data-tex="h\'(t)=0"></span> для экстремума?</span><button data-action="switch-model" aria-pressed="false">Проверить контрпример: <span data-tex="f(x,y)=x^2+y^2-1+y^3"></span></button></div><p class="instruction">Сравните две функции на одной и той же окружности. Изменится поверхность и график высоты, но не ограничение.</p></div><p class="model-context" data-model-context>Исходная функция: <span data-tex="f(x,y)=x+x^2-y^2"></span> при <span data-tex="x^2+y^2=1"></span>.</p></div>
  <div class="scene-layout"><div class="world"><div class="world-labels"><span class="blue" data-surface-label>z = x + x² − y²</span><span class="orange">x² + y² = 1</span></div><div class="world-note">Мышь — поворот · колесо — масштаб<br>Оси x, y, z показаны в одном масштабе</div></div><div class="profile-panel"><div class="plot-title" data-profile-title></div><div data-profile></div><div class="circle-readouts"><div data-circle></div><dl class="readouts math-readouts"><div class="wide"><dt data-tex="P=r(t)"></dt><dd data-value="point"></dd></div><div><dt data-tex="h(t)"></dt><dd data-value="height"></dd></div><div><dt data-tex="h'(t)"></dt><dd data-value="derivative"></dd></div><div class="wide"><dt data-tex="\\lambda\\ \\text{в стационарной точке}"></dt><dd data-value="lambda"></dd></div></dl></div><p class="proof-status" aria-live="polite"></p></div></div>
  <div class="legend"><span class="blue">Поверхность <span data-tex="f"></span></span><span class="orange">Цилиндр, пересечение и окружность</span><span class="teal" data-vector-legend hidden>Градиент <span data-tex="\\nabla f"></span></span><span class="violet" data-vector-legend hidden>Градиент <span data-tex="\\nabla g"></span></span></div>
  
  <div class="cylinder-study"><h3>Зачем нужен дополнительный пример?</h3><p class="study-context">Здесь можно заменить <em>целевую функцию</em>, сохранив ограничение <span data-tex="x^2+y^2=1"></span>. Это позволяет увидеть, почему равенство <span data-tex="h'(t)=0"></span> ещё не доказывает наличие экстремума. При переключении изменятся поверхность, график высоты и вычисления.</p><div class="study-toolbar"><div class="study-point-group"><span class="study-label">Выберите точку на окружности</span><div class="control-buttons" role="group" aria-label="Точки выбранной функции"><button data-action="minimum-plus">Минимум · y &gt; 0</button><button data-action="minimum-minus">Минимум · y &lt; 0</button></div></div></div><p class="instruction">Для стрелок <span data-tex="\\nabla f"></span> и <span data-tex="\\nabla g"></span> используется один масштаб: 0,38 единицы оси на единицу вектора. Нулевой градиент стрелкой не изображается.</p><div data-analysis></div></div>`;
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
        ? `${math("h'(t)=-\\sin t(1+4\\cos t)=0", true)}<p>Условие распадается на <span class="math-inline">${math("\\sin t=0")}</span> и <span class="math-inline">${math("\\cos t=-1/4")}</span>. Полный список кандидатов:</p><div class="table-scroll"><table><thead><tr><th>Точка</th><th>f</th><th>λ</th><th>Классификация</th></tr></thead><tbody><tr><td>(1; 0)</td><td>2</td><td>${math("\\frac32")}</td><td>Глобальный максимум</td></tr><tr><td>(−1; 0)</td><td>0</td><td>${math("\\frac12")}</td><td>Локальный, не глобальный максимум</td></tr><tr><td>(${math("-\\frac14")}; ${math("\\frac{\\sqrt{15}}4")})</td><td>${math("-\\frac98")}</td><td>−1</td><td>Глобальный минимум</td></tr><tr><td>(${math("-\\frac14")}; ${math("-\\frac{\\sqrt{15}}4")})</td><td>${math("-\\frac98")}</td><td>−1</td><td>Глобальный минимум</td></tr></tbody></table></div><p>В минимумах <span class="math-inline">${math("\\nabla f=-\\nabla g")}</span>: множитель отрицателен, поэтому градиенты противоположны.</p>`
        : `${math("h(t)=\\sin^3t,\\qquad h'(0)=0,\\qquad \\nabla f(1,0)=(2,0)=\\nabla g(1,0),\\qquad \\lambda=1", true)}<p>Это другая целевая функция, а не новое ограничение. Проведите точку через правый край окружности. Значения при малом отрицательном t отрицательны, а при положительном t положительны. При этом градиент целевой функции ненулевой и условие Лагранжа выполнено с множителем 1. <strong>Стационарная точка, не экстремум.</strong></p>`;
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
