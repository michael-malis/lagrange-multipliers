import { number } from "../../ui/format.js";
const NS = "http://www.w3.org/2000/svg";
export function svgElement(name, attrs = {}) {
  const el = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}
export function createProfile(
  host,
  model,
  onChange,
  {
    yRange = [-7, 3],
    showDerivative = true,
    tangentLabel = false,
    height = 235,
    focusWindow = null,
  } = {},
) {
  let activeModel = model;
  const w = 360,
    h = height,
    left = 38,
    right = 344,
    top = 22,
    bottom = h - 37;
  const svg = svgElement("svg", {
    viewBox: `0 0 ${w} ${h}`,
    class: "profile",
    role: "img",
    "aria-label":
      "Профиль высоты вдоль допустимой кривой. Для изменения точки используйте ползунок или перетаскивание.",
  });
  let focused = false;
  const rangeT = () => focused && focusWindow ? focusWindow.t : activeModel.domain;
  const rangeY = () => focused && focusWindow ? focusWindow.y : yRange;
  const x = (t) => {
    const [a, b] = rangeT();
    return left + ((t - a) / (b - a)) * (right - left);
  };
  const y = (z) => {
    const [a, b] = rangeY();
    return bottom - ((z - a) / (b - a)) * (bottom - top);
  };
  const visibleT = (t) => {
    if (!focused || !activeModel.periodic) return t;
    const end = activeModel.domain[1];
    // At t=0, also show the immediately preceding arc as negative angles.
    return t > end / 2 ? t - end : t;
  };
  const fixed = svgElement("g"),
    dynamic = svgElement("g");
  svg.append(fixed, dynamic);
  host.append(svg);
  const curve = svgElement("path", { class: "curve" }),
    guide = svgElement("line", { class: "guide" }),
    tangent = svgElement("line", {
      class: "tangent-line",
      "data-profile-tangent": "true",
    }),
    slopeLabel = svgElement("text", {
      class: "slope-label",
      "text-anchor": "end",
    }),
    point = svgElement("circle", { r: 5.5, class: "point" });
  dynamic.append(guide, tangent, slopeLabel, point);
  function rebuild() {
    fixed.replaceChildren();
    const [tStart, tEnd] = rangeT();
    const [zStart, zEnd] = rangeY();
    for (let i = 0; i <= 4; i++) {
      const z = zStart + (i * (zEnd - zStart)) / 4;
      fixed.append(
        svgElement("line", {
          x1: left,
          y1: y(z),
          x2: right,
          y2: y(z),
          class: "grid",
        }),
      );
      const label = svgElement("text", {
        x: left - 8,
        y: y(z) + 4,
        "text-anchor": "end",
      });
      label.textContent = number(z, 1);
      fixed.append(label);
    }
    fixed.append(
      svgElement("line", {
        x1: left,
        y1: bottom,
        x2: right,
        y2: bottom,
        class: "axis",
      }),
    );
    for (let i = 0; i <= 3; i++) {
      const t = tStart + (i * (tEnd - tStart)) / 3;
      const label = svgElement("text", {
        x: x(t),
        y: bottom + 20,
        "text-anchor": "middle",
      });
      label.textContent = focused ? number(t, 2) : activeModel.periodic
        ? i === 0
          ? "0"
          : i === 3
            ? "2π"
            : i === 1
              ? "2π/3"
              : "4π/3"
        : number(t);
      fixed.append(label);
    }
    const title = svgElement("text", { x: left, y: 13 });
    title.textContent = "h(t)";
    fixed.append(title);
    const tlabel = svgElement("text", { x: right + 9, y: bottom + 4 });
    tlabel.textContent = "t";
    fixed.append(tlabel);
    const samples = Array.from({ length: 241 }, (_, i) => {
      const t = tStart + (i * (tEnd - tStart)) / 240;
      return `${i ? "L" : "M"}${x(t).toFixed(2)},${y(activeModel.h(t)).toFixed(2)}`;
    }).join(" ");
    curve.setAttribute("d", samples);
    fixed.append(curve);
    if (focused) {
      const axis = svgElement("line", {
        x1: left, x2: right, y1: y(0), y2: y(0),
        class: "axis focus-zero",
      });
      fixed.append(axis);
      const vertical = svgElement("line", {
        x1: x(0), x2: x(0), y1: top, y2: bottom,
        class: "axis focus-zero",
      });
      fixed.append(vertical);
      const marker = svgElement("text", {
        x: x(0) + 9, y: y(0) - 12, class: "focus-origin-label",
      });
      marker.textContent = "h′(0) = 0";
      fixed.append(marker);
    }
  }
  rebuild();
  let dragging = false;
  const move = (e) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      svg.getScreenCTM().inverse(),
    );
    const fraction = Math.max(0, Math.min(1, (p.x - left) / (right - left)));
    const [a, b] = rangeT();
    const t = a + fraction * (b - a);
    onChange(activeModel.periodic && t < 0 ? t + activeModel.domain[1] : t);
  };
  svg.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = true;
    svg.setPointerCapture(e.pointerId);
    move(e);
  });
  svg.addEventListener("pointermove", (e) => {
    if (dragging) move(e);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    svg.addEventListener(type, () => (dragging = false));
  return {
    svg,
    update(s, { derivative = showDerivative, candidates = false, focus = false } = {}) {
      const nextFocus = !!(focus && focusWindow);
      if (activeModel !== s.model || nextFocus !== focused) {
        activeModel = s.model;
        focused = nextFocus;
        rebuild();
      }
      const m = s.math;
      const shownT = visibleT(s.t);
      const inView = !focused || (shownT >= rangeT()[0] && shownT <= rangeT()[1]);
      point.style.display = inView ? "" : "none";
      guide.style.display = inView ? "" : "none";
      tangent.style.display = inView && derivative ? "" : "none";
      point.setAttribute("cx", x(shownT));
      point.setAttribute("cy", y(m.height));
      point.dataset.t = String(s.t);
      point.dataset.height = String(m.height);
      guide.setAttribute("x1", x(shownT));
      guide.setAttribute("x2", x(shownT));
      guide.setAttribute("y1", y(m.height));
      guide.setAttribute("y2", bottom);
      const dt = (rangeT()[1] - rangeT()[0]) * 0.09;
      tangent.setAttribute("x1", x(shownT - dt));
      tangent.setAttribute("y1", y(m.height - dt * m.derivative));
      tangent.setAttribute("x2", x(shownT + dt));
      tangent.setAttribute("y2", y(m.height + dt * m.derivative));
      tangent.style.display = inView && derivative ? "" : "none";
      tangent.dataset.slope = String(m.derivative);
      // A fixed top-right readout cannot collide with the moving curve or tangent.
      slopeLabel.setAttribute("x", right);
      slopeLabel.setAttribute("y", 13);
      slopeLabel.textContent = `h′ = ${number(m.derivative)}`;
      slopeLabel.style.display = derivative && tangentLabel ? "" : "none";
      svg.querySelectorAll(".candidate").forEach((el) => el.remove());
      if (candidates)
        for (const c of activeModel.critical) {
          const shownCandidateT = visibleT(c.t);
          if (focused && (shownCandidateT < rangeT()[0] || shownCandidateT > rangeT()[1])) continue;
          const el = svgElement("circle", {
            cx: x(shownCandidateT),
            cy: y(c.height),
            r: 4,
            fill: "none",
            stroke: "#e3a15c",
            "stroke-width": 1.5,
            class: "candidate",
          });
          dynamic.prepend(el);
        }
    },
  };
}
