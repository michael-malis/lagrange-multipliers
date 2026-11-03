import { svgElement } from "./profile.js";
import { paraboloid } from "../../math/examples/paraboloid.js";
export function createGradientPlot(host, onChange) {
  const size = 560,
    pad = 44,
    min = -1,
    max = 6,
    scale = (size - 2 * pad) / (max - min),
    vectorScale = 0.65;
  const xy = ([x, y]) => [
    pad + (x - min) * scale,
    size - pad - (y - min) * scale,
  ];
  const svg = svgElement("svg", {
    viewBox: `0 0 ${size} ${size}`,
    class: "plane",
    role: "img",
    "aria-label":
      "Линии уровня, прямая ограничения и векторы в равном масштабе осей x и y",
  });
  host.append(svg);
  const defs = svgElement("defs");
  svg.append(defs);
  const clip = svgElement("clipPath", { id: "plane-clip" });
  clip.append(
    svgElement("rect", {
      x: pad,
      y: pad,
      width: size - 2 * pad,
      height: size - 2 * pad,
    }),
  );
  defs.append(clip);
  const colors = {
    gradient: "#77bdb5",
    normal: "#b6a4cf",
    tangent: "#d1d3d1",
    projection: "#a1ddd3",
  };
  for (const [key, color] of Object.entries(colors)) {
    const marker = svgElement("marker", {
      id: `arrow-${key}`,
      viewBox: "0 0 10 10",
      refX: 9,
      refY: 5,
      markerWidth: 7,
      markerHeight: 7,
      orient: "auto-start-reverse",
      markerUnits: "userSpaceOnUse",
    });
    marker.append(
      svgElement("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: color }),
    );
    defs.append(marker);
  }
  const plot = svgElement("g", { "clip-path": "url(#plane-clip)" });
  svg.append(plot);
  for (let k = 0; k <= 6; k++) {
    const [x, y] = xy([k, k]),
      [zeroX, zeroY] = xy([0, 0]);
    plot.append(
      svgElement("line", {
        x1: x,
        y1: pad,
        x2: x,
        y2: size - pad,
        class: k === 0 ? "axis" : "grid",
      }),
    );
    plot.append(
      svgElement("line", {
        x1: pad,
        y1: y,
        x2: size - pad,
        y2: y,
        class: k === 0 ? "axis" : "grid",
      }),
    );
    if (k > 0) {
      const lx = svgElement("text", {
        x,
        y: zeroY + 19,
        "text-anchor": "middle",
      });
      lx.textContent = k;
      svg.append(lx);
      const ly = svgElement("text", {
        x: zeroX - 13,
        y: y + 4,
        "text-anchor": "end",
      });
      ly.textContent = k;
      svg.append(ly);
    }
  }
  const [ox, oy] = xy([0, 0]);
  for (const [text, x, y] of [
    ["x", size - pad + 15, oy + 4],
    ["y", ox - 4, pad - 13],
    ["0", ox - 15, oy + 19],
  ]) {
    const l = svgElement("text", { x, y });
    l.textContent = text;
    svg.append(l);
  }
  const contours = svgElement("g");
  plot.append(contours);
  const level = (d) => {
    const contour = paraboloid.levelSet(d),
      [cx, cy] = xy(contour.center);
    return svgElement("ellipse", {
      cx,
      cy,
      rx: contour.radii[0] * scale,
      ry: contour.radii[1] * scale,
      class: "contour",
    });
  };
  for (const d of [-10, -5, -1, 1, 7 / 3, 4]) contours.append(level(d));
  const active = level(1);
  active.classList.add("active-contour");
  plot.append(active);
  const [x1, y1] = xy([-1, 4]),
    [x2, y2] = xy([4, -1]);
  plot.append(svgElement("line", { x1, y1, x2, y2, class: "constraint" }));
  const fixedLabel = svgElement("text", {
    x: xy([0.1, 3.4])[0],
    y: xy([0.1, 3.4])[1],
    class: "point-label",
  });
  fixedLabel.textContent = "x + y = 3";
  svg.append(fixedLabel);
  const dynamic = svgElement("g");
  plot.append(dynamic);
  function label(text, p, color, dx = 0, dy = 0) {
    const [x, y] = xy(p);
    const l = svgElement("text", {
      x: x + dx,
      y: y + dy,
      class: "vector-label",
      fill: color,
    });
    l.style.fill = color;
    l.textContent = text;
    dynamic.append(l);
  }
  function arrow(key, p, v, { dx = 8, dy = -10 } = {}) {
    const len = Math.hypot(...v);
    if (len < 1e-9) return;
    const end = p.map((x, i) => x + v[i] * vectorScale),
      [x1, y1] = xy(p),
      [x2, y2] = xy(end);
    const l = svgElement("line", {
      x1,
      y1,
      x2,
      y2,
      stroke: colors[key],
      "stroke-width": key === "projection" ? 4 : 2.2,
      "marker-end": `url(#arrow-${key})`,
      "data-vector": key,
    });
    if (key === "tangent") l.setAttribute("stroke-dasharray", "5 4");
    dynamic.append(l);
    label(
      { gradient: "∇f", normal: "∇g", tangent: "T", projection: "projₜ ∇f" }[
        key
      ],
      end,
      colors[key],
      dx,
      dy,
    );
  }
  let dragging = false;
  const move = (e) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      svg.getScreenCTM().inverse(),
    );
    const x = (p.x - pad) / scale + min,
      y = (size - pad - p.y) / scale + min;
    onChange(Math.max(0, Math.min(3, (x - y + 3) / 2)));
  };
  svg.addEventListener("pointerdown", (e) => {
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
    update(s) {
      dynamic.replaceChildren();
      const m = s.math,
        p = m.point;
      const [cx, cy] = xy(p);
      const contour = s.model.levelSet(m.height);
      active.setAttribute("rx", contour.radii[0] * scale);
      active.setAttribute("ry", contour.radii[1] * scale);
      if (s.step >= 1) {
        arrow("tangent", p, m.tangent, { dx: 12, dy: 23 });
        arrow("gradient", p, m.gradient);
      }
      if (s.step >= 2) {
        if (Math.hypot(...m.projection) > 1e-9) {
          arrow("projection", p, m.projection, { dx: 12, dy: 4 });
          const a = xy(p.map((x, i) => x + m.gradient[i] * vectorScale)),
            b = xy(p.map((x, i) => x + m.projection[i] * vectorScale));
          dynamic.append(
            svgElement("line", {
              x1: a[0],
              y1: a[1],
              x2: b[0],
              y2: b[1],
              stroke: colors.projection,
              "stroke-dasharray": "3 5",
              opacity: 0.5,
            }),
          );
        } else {
          dynamic.append(
            svgElement("circle", {
              cx,
              cy,
              r: 10,
              fill: "none",
              stroke: colors.projection,
              "stroke-width": 2,
              "data-zero-projection": "true",
            }),
          );
          label("projₜ ∇f = 0", p, colors.projection, -99, -22);
        }
      }
      if (s.step >= 3) arrow("normal", p, m.normal, { dx: -33, dy: -12 });
      if (s.step >= 3 || (s.step >= 2 && m.stationary)) {
        const u = 0.22,
          a = [p[0] + u, p[1] - u],
          b = [p[0] + 2 * u, p[1]],
          c = [p[0] + u, p[1] + u];
        dynamic.append(
          svgElement("path", {
            d: `M${xy(a)} L${xy(b)} L${xy(c)}`,
            fill: "none",
            stroke: s.step >= 3 ? colors.normal : colors.gradient,
            "stroke-width": 1.5,
          }),
        );
      }
      dynamic.append(svgElement("circle", { cx, cy, r: 5.8, class: "point" }));
      label("P", p, "#e3a15c", -21, 17);
      svg.dataset.scaleX = scale;
      svg.dataset.scaleY = scale;
      svg.dataset.projection = JSON.stringify(m.projection);
      svg.dataset.gradient = JSON.stringify(m.gradient);
    },
  };
}
