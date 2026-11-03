import { paraboloid } from "../math/examples/paraboloid.js";
import { createStore } from "../state/sceneStore.js";
import { createSurface } from "../graphics/three/surface.js";
import { createProfile } from "../graphics/svg/profile.js";
import { number, pair, math, renderMath } from "../ui/format.js";
export function SurfaceScene(root) {
  const store = createStore(paraboloid);
  root.innerHTML = `<div class="scene-top"><span class="scene-label">Рис. 1 · Поверхность, ограничение и профиль высоты</span><button data-action="reset">Сбросить</button></div><div class="controls"><div class="slider-row"><label for="surface-t">Параметр <span data-tex="t"></span></label><input id="surface-t" type="range" min="0" max="3" step="0.005" value="1"><output for="surface-t"></output></div><div class="control-buttons"><button class="primary" data-action="plane" aria-pressed="false">Показать ограничение</button><button data-action="optimum">Точно в максимум</button><button data-action="sections" aria-pressed="false">Координатные сечения</button><button data-action="camera">Исходный ракурс</button></div><p class="instruction" data-observation>Вершина (3; 2) выше всех точек поверхности, но не лежит на допустимой прямой.</p></div>
  <div class="scene-layout"><div class="world"><div class="world-labels"><span class="blue">z = f(x, y)</span><span class="orange" data-plane-label hidden>x + y = 3</span></div><div class="world-note">Мышь — поворот · колесо — масштаб<br>Масштаб высоты сжат: z × 0,48</div></div><div class="profile-panel"><div class="plot-title">Высота вдоль допустимой прямой: <span data-tex="h(t)=f(r(t))"></span></div><div data-profile></div><dl class="readouts math-readouts"><div class="wide"><dt data-tex="P=r(t)"></dt><dd data-value="point"></dd></div><div><dt data-tex="h(t)"></dt><dd data-value="height"></dd></div><div><dt data-tex="h'(t)"></dt><dd data-value="derivative"></dd></div><div data-partial hidden><dt data-tex="f_x(P)"></dt><dd data-value="fx"></dd></div><div data-partial hidden><dt data-tex="f_y(P)"></dt><dd data-value="fy"></dd></div></dl><p class="instruction">Ползунок и профиль перемещают математическую точку; камера меняет только ракурс.</p></div></div><div class="legend"><span class="blue">Поверхность <span data-tex="f"></span></span><span class="orange">Допустимая кривая и текущая точка</span></div><div class="section-note" data-sections-note hidden>${math("C_x(s)=(s,y_0,f(s,y_0)),\\qquad C_y(s)=(x_0,s,f(x_0,s))", true)}<p>Цветные прямые касаются координатных сечений поверхности. Их наклоны равны <span data-tex="f_x(P)"></span> и <span data-tex="f_y(P)"></span>; это не двумерные стрелки градиента.</p></div>`;
  renderMath(root);
  const view = createSurface(root.querySelector(".world"), paraboloid);
  const profile = createProfile(
    root.querySelector("[data-profile]"),
    paraboloid,
    (t) => store.set({ t, step: Math.max(1, store.get().step) }),
  );
  const slider = root.querySelector("input");
  slider.addEventListener("input", () =>
    store.set({ t: +slider.value, step: Math.max(1, store.get().step) }),
  );
  root.querySelector("[data-action=plane]").onclick = () =>
    store.set({ step: store.get().step ? 0 : 1 });
  root.querySelector("[data-action=optimum]").onclick = () =>
    store.set({ t: 5 / 3, step: 1 });
  root.querySelector("[data-action=sections]").onclick = () =>
    store.set({ sections: !store.get().sections, step: 1 });
  root.querySelector("[data-action=camera]").onclick = () => view.resetCamera();
  root.querySelector("[data-action=reset]").onclick = () => {
    store.reset();
    view.resetCamera();
  };
  store.subscribe((s) => {
    view.update(s);
    profile.update(s);
    slider.value = s.t;
    root.querySelector("output").textContent = number(s.t);
    for (const [key, value] of Object.entries({
      point: pair(s.math.point),
      height: number(s.math.height),
      derivative: number(s.math.derivative),
      fx: number(s.math.gradient[0]),
      fy: number(s.math.gradient[1]),
    }))
      root.querySelector(`[data-value=${key}]`).textContent = value;
    root.querySelector("[data-plane-label]").hidden = !s.step;
    root
      .querySelector("[data-action=plane]")
      .setAttribute("aria-pressed", !!s.step);
    root
      .querySelector("[data-action=sections]")
      .setAttribute("aria-pressed", s.sections);
    root
      .querySelectorAll("[data-partial],[data-sections-note]")
      .forEach((e) => (e.hidden = !s.sections));
    root.querySelector("[data-observation]").textContent = !s.step
      ? "Начните с поверхности: её вершина (3, 2) не лежит на допустимой прямой."
      : s.math.stationary
        ? "Допустимая высота максимальна. Градиент остаётся ненулевым: (8/3; 8/3)."
        : s.math.derivative > 0
          ? "При увеличении t точка поднимается по допустимой траектории."
          : "При увеличении t точка спускается по допустимой траектории.";
    root.dataset.t = s.t;
    root.dataset.height = s.math.height;
    root.dataset.step = s.step;
  });
  return store;
}
