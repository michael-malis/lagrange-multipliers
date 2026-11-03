import { svgElement } from "./profile.js";
import { paraboloid } from "../../math/examples/paraboloid.js";
import { number } from "../../ui/format.js";

const VECTOR_COLORS = {
  gradient: "#47e1c2",
  normal: "#c29aff",
  tangent: "#eef5f1",
  projection: "#a7ffe7",
};

export function createGradientPlot(host, onChange) {
  const size = 620,
    pad = 54,
    min = -1,
    max = 6,
    axisScale = (size - 2 * pad) / (max - min),
    vectorScale = 0.58;
  const xy = ([x, y]) => [
    pad + (x - min) * axisScale,
    size - pad - (y - min) * axisScale,
  ];
  const svg = svgElement("svg", {
    viewBox: `0 0 ${size} ${size}`,
    class: "plane",
    role: "img",
    "aria-label":
      "Линии уровня f(x,y)=c, допустимая прямая и вычисленные векторы. Масштабы осей x и y равны.",
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
  for (const [key, color] of Object.entries(VECTOR_COLORS)) {
    const marker = svgElement("marker", {
      id: `arrow-${key}`,
      viewBox: "0 0 10 10",
      refX: 9,
      refY: 5,
      markerWidth: 8,
      markerHeight: 8,
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
  for (let k = min; k <= max; k++) {
    const [gx, gy] = xy([k, k]);
    plot.append(
      svgElement("line", {
        x1: gx,
        y1: pad,
        x2: gx,
        y2: size - pad,
        class: k === 0 ? "axis" : "grid",
      }),
      svgElement("line", {
        x1: pad,
        y1: gy,
        x2: size - pad,
        y2: gy,
        class: k === 0 ? "axis" : "grid",
      }),
    );
    if (k !== 0) {
      const lx = svgElement("text", {
        x: gx,
        y: xy([0, 0])[1] + 21,
        "text-anchor": "middle",
      });
      lx.textContent = k;
      const ly = svgElement("text", {
        x: xy([0, 0])[0] - 14,
        y: gy + 4,
        "text-anchor": "end",
      });
      ly.textContent = k;
      svg.append(lx, ly);
    }
  }
  const [originX, originY] = xy([0, 0]);
  for (const [text, x, y] of [
    ["x", size - pad + 18, originY + 4],
    ["y", originX - 4, pad - 16],
    ["0", originX - 17, originY + 21],
  ]) {
    const axisLabel = svgElement("text", { x, y });
    axisLabel.textContent = text;
    svg.append(axisLabel);
  }

  const contourLayer = svgElement("g");
  plot.append(contourLayer);
  const ellipseFor = (value, className = "contour") => {
    const contour = paraboloid.levelSet(value),
      [cx, cy] = xy(contour.center);
    return svgElement("ellipse", {
      cx,
      cy,
      rx: contour.radii[0] * axisScale,
      ry: contour.radii[1] * axisScale,
      class: className,
      "data-level": value,
    });
  };
  const fixedLevels = [
    { value: -6, angle: 2.42, anchor: "end" },
    { value: -3, angle: 0, anchor: "start" },
    { value: 0, angle: -Math.PI / 2, anchor: "middle" },
    { value: 2, angle: Math.PI, anchor: "end" },
    { value: 3, angle: Math.PI / 2, anchor: "middle" },
    { value: 4, angle: 0, anchor: "start" },
  ];
  for (const config of fixedLevels) {
    const contour = paraboloid.levelSet(config.value);
    contourLayer.append(ellipseFor(config.value));
    const point = [
        contour.center[0] + contour.radii[0] * Math.cos(config.angle),
        contour.center[1] + contour.radii[1] * Math.sin(config.angle),
      ],
      [x, y] = xy(point),
      label = svgElement("text", {
        x: x + (config.anchor === "start" ? 7 : config.anchor === "end" ? -7 : 0),
        y: y - 7,
        "text-anchor": config.anchor,
        class: "contour-label",
      });
    label.textContent = `c = ${number(config.value)}`;
    contourLayer.append(label);
  }

  const activeLayer = svgElement("g", { class: "active-level" }),
    activeContour = ellipseFor(1, "active-contour"),
    activeLabel = svgElement("text", {
      class: "active-contour-label",
      "text-anchor": "middle",
    });
  activeLayer.append(activeContour, activeLabel);
  plot.append(activeLayer);

  const [x1, y1] = xy([-1, 4]),
    [x2, y2] = xy([4, -1]);
  plot.append(svgElement("line", { x1, y1, x2, y2, class: "constraint" }));
  const constraintLabel = svgElement("text", {
    x: xy([0.1, 3.4])[0],
    y: xy([0.1, 3.4])[1],
    class: "constraint-label",
  });
  constraintLabel.textContent = "x + y = 3";
  svg.append(constraintLabel);

  const dynamic = svgElement("g");
  plot.append(dynamic);
  function label(text, p, color, dx = 0, dy = 0, className = "vector-label") {
    const [x, y] = xy(p),
      element = svgElement("text", {
        x: x + dx,
        y: y + dy,
        class: className,
        fill: color,
      });
    element.style.fill = color;
    element.textContent = text;
    dynamic.append(element);
  }
  function arrow(key, p, v, { dx = 9, dy = -12 } = {}) {
    if (Math.hypot(...v) < 1e-9) return;
    const end = p.map((coordinate, i) => coordinate + v[i] * vectorScale),
      [startX, startY] = xy(p),
      [endX, endY] = xy(end),
      line = svgElement("line", {
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        stroke: VECTOR_COLORS[key],
        "stroke-width": key === "projection" ? 4.5 : 2.6,
        "marker-end": `url(#arrow-${key})`,
        "data-vector": key,
      });
    if (key === "tangent") line.setAttribute("stroke-dasharray", "7 5");
    dynamic.append(line);
    label(
      {
        gradient: "∇f",
        normal: "∇g",
        tangent: "T",
        projection: "proj_T ∇f",
      }[key],
      end,
      VECTOR_COLORS[key],
      dx,
      dy,
    );
  }
  function drawAngle(p, tangent, gradient, radians) {
    if (radians === null) return;
    const [cx, cy] = xy(p),
      screenAngle = (v) => Math.atan2(-v[1], v[0]),
      start = screenAngle(tangent),
      end = screenAngle(gradient);
    let delta = end - start;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    const radius = 43,
      startPoint = [cx + radius * Math.cos(start), cy + radius * Math.sin(start)],
      endPoint = [
        cx + radius * Math.cos(start + delta),
        cy + radius * Math.sin(start + delta),
      ],
      arc = svgElement("path", {
        d: `M ${startPoint[0]} ${startPoint[1]} A ${radius} ${radius} 0 0 ${delta >= 0 ? 1 : 0} ${endPoint[0]} ${endPoint[1]}`,
        class: "angle-arc",
        "data-angle": radians,
      });
    dynamic.append(arc);
    const middle = start + delta / 2,
      labelRadius = 62,
      angleText = svgElement("text", {
        x: cx + labelRadius * Math.cos(middle),
        y: cy + labelRadius * Math.sin(middle) + 4,
        "text-anchor": "middle",
        class: "angle-label",
        "data-angle-label": "true",
      });
    angleText.textContent = `θ = ${number((radians * 180) / Math.PI, 1)}°`;
    dynamic.append(angleText);
  }

  let dragging = false;
  const move = (event) => {
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
        svg.getScreenCTM().inverse(),
      ),
      x = (point.x - pad) / axisScale + min,
      y = (size - pad - point.y) / axisScale + min;
    onChange(Math.max(0, Math.min(3, (x - y + 3) / 2)));
  };
  svg.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    dragging = true;
    svg.setPointerCapture(event.pointerId);
    move(event);
  });
  svg.addEventListener("pointermove", (event) => {
    if (dragging) move(event);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    svg.addEventListener(type, () => (dragging = false));

  return {
    svg,
    update(state) {
      dynamic.replaceChildren();
      const math = state.math,
        point = math.point,
        [cx, cy] = xy(point),
        contour = state.model.levelSet(math.height);
      activeContour.setAttribute("rx", contour.radii[0] * axisScale);
      activeContour.setAttribute("ry", contour.radii[1] * axisScale);
      const activeAngle = -0.68,
        labelPoint = [
          contour.center[0] + contour.radii[0] * Math.cos(activeAngle),
          contour.center[1] + contour.radii[1] * Math.sin(activeAngle),
        ],
        [labelX, labelY] = xy(labelPoint);
      activeLabel.setAttribute("x", labelX);
      activeLabel.setAttribute("y", labelY - 10);
      activeLabel.textContent = `f(P) = h(t) = ${number(math.height)}`;

      if (state.step >= 1) {
        arrow("tangent", point, math.tangent, { dx: 13, dy: 25 });
        arrow("gradient", point, math.gradient);
        drawAngle(point, math.tangent, math.gradient, math.angle);
      }
      if (state.step >= 2) {
        if (math.projectionNorm > 1e-9) {
          arrow("projection", point, math.projection, { dx: 13, dy: 5 });
          const gradientEnd = xy(
              point.map((coordinate, i) => coordinate + math.gradient[i] * vectorScale),
            ),
            projectionEnd = xy(
              point.map((coordinate, i) => coordinate + math.projection[i] * vectorScale),
            );
          dynamic.append(
            svgElement("line", {
              x1: gradientEnd[0],
              y1: gradientEnd[1],
              x2: projectionEnd[0],
              y2: projectionEnd[1],
              class: "projection-drop",
            }),
          );
        } else {
          dynamic.append(
            svgElement("circle", {
              cx,
              cy,
              r: 12,
              class: "zero-projection",
              "data-zero-projection": "true",
            }),
          );
          label("proj_T ∇f = 0", point, VECTOR_COLORS.projection, -116, -25);
        }
      }
      if (state.step >= 3)
        arrow("normal", point, math.normal, { dx: -38, dy: -14 });
      if (state.step >= 3 || (state.step >= 2 && math.stationary)) {
        const u = 0.22,
          a = [point[0] + u, point[1] - u],
          b = [point[0] + 2 * u, point[1]],
          c = [point[0] + u, point[1] + u];
        dynamic.append(
          svgElement("path", {
            d: `M${xy(a)} L${xy(b)} L${xy(c)}`,
            class: "right-angle",
          }),
        );
      }
      if (math.stationary) {
        dynamic.append(
          svgElement("circle", {
            cx,
            cy,
            r: 17,
            class: "tangency-ring",
            "data-tangency": "true",
          }),
        );
      }
      dynamic.append(svgElement("circle", { cx, cy, r: 6.5, class: "point" }));
      label("P", point, "#ffad63", -22, 19);
      svg.dataset.scaleX = axisScale;
      svg.dataset.scaleY = axisScale;
      svg.dataset.projection = JSON.stringify(math.projection);
      svg.dataset.gradient = JSON.stringify(math.gradient);
      svg.dataset.angle = String(math.angle);
      svg.dataset.level = String(math.height);
      svg.dataset.derivative = String(math.derivative);
    },
  };
}
