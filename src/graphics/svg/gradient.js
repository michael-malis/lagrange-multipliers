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
  // Crop unused space above the level sets without distorting x/y geometry.
  const width = 620,
    height = 552,
    pad = 54,
    min = -1,
    max = 6,
    yMax = 5.15,
    axisScale = (width - 2 * pad) / (max - min),
    plotBottom = pad + (yMax - min) * axisScale,
    vectorScale = 0.58;
  const xy = ([x, y]) => [
    pad + (x - min) * axisScale,
    pad + (yMax - y) * axisScale,
  ];
  const svg = svgElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    class: "plane",
    role: "img",
    "aria-label":
      "Линии уровня, допустимая прямая и векторы. Колесо мыши приближает график, перетаскивание фона перемещает область просмотра, перетаскивание точки изменяет параметр. Масштабы осей x и y равны.",
  });
  host.append(svg);

  const defs = svgElement("defs");
  svg.append(defs);
  const clip = svgElement("clipPath", { id: "plane-clip" });
  const clipRect = svgElement("rect", {
    x: pad,
    y: pad,
    width: width - 2 * pad,
    height: plotBottom - pad,
  });
  clip.append(clipRect);
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
  // Draw extra grid beyond the initial viewport so panning never exposes
  // a blank mathematical canvas. The camera-aligned clip preserves margins.
  const gridRange = 18;
  for (let k = -gridRange; k <= gridRange; k++) {
    const [gx, gy] = xy([k, k]);
    plot.append(
      svgElement("line", {
        x1: gx,
        y1: xy([0, gridRange])[1],
        x2: gx,
        y2: xy([0, -gridRange])[1],
        class: k === 0 ? "axis" : "grid",
      }),
      svgElement("line", {
        x1: xy([-gridRange, 0])[0],
        y1: gy,
        x2: xy([gridRange, 0])[0],
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
      svg.append(lx);
      svg.append(ly);
    }
  }
  const [originX, originY] = xy([0, 0]);
  for (const [text, x, y] of [
    ["x", width - pad + 18, originY + 4],
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
    { value: 0, angle: -Math.PI / 2, anchor: "middle" },
    { value: 3, angle: 0.7, anchor: "start" },
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
    activeContour = ellipseFor(1, "active-contour");
  activeLayer.append(activeContour);
  plot.append(activeLayer);

  const [x1, y1] = xy([-gridRange, 3 + gridRange]),
    [x2, y2] = xy([3 + gridRange, -gridRange]);
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
    // The synchronized legend identifies vectors; SVG labels would collide
    // with the curve, angle and other vectors as the parameter changes.
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
    // The measured angle is displayed in the adjacent numeric panel.
  }

  // Camera operates only on the 2D coordinate view, never on mathematical
  // state. The SVG viewBox changes uniformly along both axes.
  const camera = { x: 0, y: 0, width, height };
  const initialCamera = { ...camera };
  let currentPoint = [1, 2];
  let dragMode = null;
  let pointerPrevious = null;
  const toWorld = (clientX, clientY) =>
    new DOMPoint(clientX, clientY).matrixTransform(svg.getScreenCTM().inverse());
  function refreshCamera() {
    svg.setAttribute(
      "viewBox",
      `${camera.x} ${camera.y} ${camera.width} ${camera.height}`,
    );
    const horizontalUnit = camera.width / width,
      verticalUnit = camera.height / height;
    clipRect.setAttribute("x", camera.x + pad * horizontalUnit);
    clipRect.setAttribute("y", camera.y + pad * verticalUnit);
    clipRect.setAttribute("width", (width - 2 * pad) * horizontalUnit);
    clipRect.setAttribute("height", (plotBottom - pad) * verticalUnit);
    const zoom = width / camera.width;
    svg.dataset.zoom = String(Number(zoom.toFixed(3)));
    svg.dataset.scaleX = String(axisScale * zoom);
    svg.dataset.scaleY = String(axisScale * zoom);
  }
  function zoomAt(factor, clientX, clientY) {
    const oldZoom = width / camera.width,
      newZoom = Math.max(0.8, Math.min(4, oldZoom * factor));
    if (Math.abs(newZoom - oldZoom) < 1e-8) return;
    const anchor =
      clientX === undefined || clientY === undefined
        ? { x: camera.x + camera.width / 2, y: camera.y + camera.height / 2 }
        : toWorld(clientX, clientY);
    const fractionX = (anchor.x - camera.x) / camera.width,
      fractionY = (anchor.y - camera.y) / camera.height;
    camera.width = width / newZoom;
    camera.height = height / newZoom;
    camera.x = anchor.x - fractionX * camera.width;
    camera.y = anchor.y - fractionY * camera.height;
    refreshCamera();
  }
  function resetView() {
    Object.assign(camera, initialCamera);
    refreshCamera();
  }
  const movePoint = (event) => {
    const point = toWorld(event.clientX, event.clientY),
      x = (point.x - pad) / axisScale + min,
      y = yMax - (point.y - pad) / axisScale;
    onChange(Math.max(0, Math.min(3, (x - y + 3) / 2)));
  };
  function hitsConstraintOrPoint(event) {
    const transform = svg.getScreenCTM(),
      current = new DOMPoint(...xy(currentPoint)).matrixTransform(transform),
      distanceToPoint = Math.hypot(event.clientX - current.x, event.clientY - current.y);
    if (distanceToPoint < 22) return true;
    const point = toWorld(event.clientX, event.clientY),
      x = (point.x - pad) / axisScale + min,
      y = yMax - (point.y - pad) / axisScale;
    const distanceInSvg = Math.abs(x + y - 3) * axisScale / Math.SQRT2,
      pixelsPerSvgUnit = svg.getBoundingClientRect().width / camera.width;
    return distanceInSvg * pixelsPerSvgUnit < 14;
  }
  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragMode = !event.shiftKey && hitsConstraintOrPoint(event) ? "point" : "pan";
    pointerPrevious = { x: event.clientX, y: event.clientY };
    svg.dataset.dragMode = dragMode;
    svg.setPointerCapture(event.pointerId);
    if (dragMode === "point") movePoint(event);
  });
  svg.addEventListener("pointermove", (event) => {
    if (!dragMode) return;
    if (dragMode === "point") {
      movePoint(event);
      return;
    }
    const rect = svg.getBoundingClientRect();
    camera.x -= ((event.clientX - pointerPrevious.x) * camera.width) / rect.width;
    camera.y -= ((event.clientY - pointerPrevious.y) * camera.height) / rect.height;
    pointerPrevious = { x: event.clientX, y: event.clientY };
    refreshCamera();
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    svg.addEventListener(type, () => {
      dragMode = null;
      pointerPrevious = null;
      svg.dataset.dragMode = "idle";
    });
  svg.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomAt(Math.exp(-event.deltaY * 0.0013), event.clientX, event.clientY);
  }, { passive: false });
  svg.addEventListener("dblclick", (event) => {
    event.preventDefault();
    resetView();
  });
  svg.dataset.dragMode = "idle";
  refreshCamera();

  return {
    svg,
    zoomIn: () => zoomAt(1.3),
    zoomOut: () => zoomAt(1 / 1.3),
    resetView,
    update(state) {
      currentPoint = state.math.point;
      dynamic.replaceChildren();
      const math = state.math,
        point = math.point,
        [cx, cy] = xy(point),
        contour = state.model.levelSet(math.height);
      activeContour.setAttribute("rx", contour.radii[0] * axisScale);
      activeContour.setAttribute("ry", contour.radii[1] * axisScale);
      // Dynamic level value is displayed beside the diagram, not over it.

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
      label("P", point, "#ffad63", -18, 20);
      svg.dataset.scaleX = axisScale * width / camera.width;
      svg.dataset.scaleY = axisScale * width / camera.width;
      svg.dataset.projection = JSON.stringify(math.projection);
      svg.dataset.gradient = JSON.stringify(math.gradient);
      svg.dataset.angle = String(math.angle);
      svg.dataset.level = String(math.height);
      svg.dataset.derivative = String(math.derivative);
    },
  };
}
