import { paraboloid } from "../math/examples/paraboloid.js";
import { paraboloidStore } from "../state/paraboloidStore.js";
import { createSurface } from "../graphics/three/surface.js";
import { createProfile } from "../graphics/svg/profile.js";
import { number, pair, math, renderMath } from "../ui/format.js";
export function SurfaceScene(root) {
  const store = paraboloidStore;
  root.innerHTML = `<div class="scene-top"><span class="scene-label">Рис. 1 · Поверхность и высота на допустимой прямой</span><button data-action="reset">Сбросить</button></div><div class="controls"><div class="slider-row"><label for="surface-t">Параметр <span data-tex="t"></span></label><input id="surface-t" type="range" min="0" max="3" step="0.005" value="1"><output for="surface-t"></output></div><div class="surface-control-groups">
    <div class="surface-control-group"><span class="controls-label">Допустимое движение</span><div class="control-buttons" role="group" aria-label="Положение точки и ограничение"><button class="primary" data-action="plane" aria-pressed="false">Показать ограничение</button><button data-action="optimum">Точно в максимум</button></div></div>
    <div class="surface-control-group"><span class="controls-label">Координатные сечения</span><div class="control-buttons" role="group" aria-label="Выбор координатного сечения"><button data-action="section-x" aria-pressed="false">По x</button><button data-action="section-y" aria-pressed="false">По y</button><button data-action="sections" aria-pressed="false">Оба</button></div></div>
    <div class="surface-control-group"><span class="controls-label">Ракурс камеры</span><div class="control-buttons" role="group" aria-label="Положение камеры"><button data-action="camera">Поверхность</button><button data-action="camera-section">Сечение</button><button data-action="camera-top">Вид сверху</button></div></div>
  </div><p class="instruction" data-observation>Вершина (3; 2) выше всех точек поверхности, но не лежит на допустимой прямой.</p></div>
  <div class="scene-layout"><div class="world"><div class="world-labels"><span class="blue" data-tex="z=f(x,y)"></span><span class="orange" data-plane-label data-tex="x+y=3" hidden></span></div><div class="world-note">Мышь — поворот · колесо — масштаб<br>Масштаб высоты сжат: z × 0,48</div></div><div class="profile-panel"><div class="plot-title">Высота вдоль допустимой прямой: <span data-tex="h(t)=f(r(t))"></span></div><div data-profile></div><dl class="readouts math-readouts"><div class="wide"><dt data-tex="P=r(t)"></dt><dd data-value="point"></dd></div><div><dt data-tex="h(t)"></dt><dd data-value="height"></dd></div><div><dt data-tex="h'(t)"></dt><dd data-value="derivative"></dd></div><div data-partial hidden><dt data-tex="f_x(P)"></dt><dd data-value="fx"></dd></div><div data-partial hidden><dt data-tex="f_y(P)"></dt><dd data-value="fy"></dd></div></dl><p class="instruction">Ползунок и график высоты изменяют положение точки на поверхности; камера меняет только ракурс.</p></div></div><div class="legend"><span class="blue">Поверхность <span data-tex="f"></span></span><span class="orange" data-constraint-legend hidden>Кривая пересечения и текущая точка</span></div><div class="section-note" data-sections-note hidden>${math("C_x(s)=(s,y_0,f(s,y_0)),\\qquad C_y(s)=(x_0,s,f(x_0,s))", true)}<p>Цветные прямые касаются координатных сечений поверхности. Их наклоны равны <span data-tex="f_x(P)"></span> и <span data-tex="f_y(P)"></span>; это не двумерные стрелки градиента.</p></div>`;
  renderMath(root);
  const view = createSurface(root.querySelector(".world"), paraboloid);
  const profile = createProfile(
    root.querySelector("[data-profile]"),
    paraboloid,
    (t) => store.set({ t, plane: true }),
  );
  const slider = root.querySelector("input");
  slider.addEventListener("input", () =>
    store.set({ t: +slider.value, plane: true }),
  );
  root.querySelector("[data-action=plane]").onclick = () =>
    store.set({ plane: !store.get().plane });
  root.querySelector("[data-action=optimum]").onclick = () =>
    store.set({ t: 5 / 3, plane: true });
  for (const axis of ["x", "y"])
    root.querySelector(`[data-action="section-${axis}"]`).onclick = () =>
      store.set({ sections: true, sectionMode: axis, plane: true });
  root.querySelector("[data-action=sections]").onclick = () =>
    store.set({ sections: !store.get().sections || store.get().sectionMode !== "both", sectionMode: "both", plane: true });
  root.querySelector("[data-action=camera]").onclick = () => view.resetCamera();
  root.querySelector("[data-action=camera-section]").onclick = () => view.setView("section");
  root.querySelector("[data-action=camera-top]").onclick = () => view.setView("top");
  root.querySelector("[data-action=reset]").onclick = () => {
    store.set({ t: paraboloid.initial, sections: false, sectionMode: "both", plane: false });
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
    root.querySelector("[data-plane-label]").hidden = !s.plane;
    root.querySelector("[data-constraint-legend]").hidden = !s.plane;
    root
      .querySelector("[data-action=plane]")
      .setAttribute("aria-pressed", !!s.plane);
    for (const axis of ["x", "y"])
      root.querySelector(`[data-action="section-${axis}"]`).setAttribute("aria-pressed", String(s.sections && s.sectionMode === axis));
    root.querySelector("[data-action=sections]").setAttribute("aria-pressed", String(s.sections && s.sectionMode === "both"));
    root
      .querySelectorAll("[data-partial],[data-sections-note]")
      .forEach((e) => (e.hidden = !s.sections));
    root.querySelector("[data-observation]").innerHTML = !s.plane
      ? "Начните с поверхности: её вершина " + math("(3,2)") + " не лежит на допустимой прямой."
      : s.math.stationary
        ? "Высота на прямой максимальна, хотя " + math("\\nabla f=(\\frac83,\\frac83)\\ne0") + "."
        : s.math.derivative > 0
          ? "При увеличении " + math("t") + " высота вдоль допустимой прямой возрастает."
          : "При увеличении " + math("t") + " высота вдоль допустимой прямой убывает.";
    root.dataset.t = s.t;
    root.dataset.height = s.math.height;
    root.dataset.plane = s.plane;
    root.dataset.sectionMode = s.sections ? s.sectionMode : "none";
  });
  return store;
}
