import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { svgElement } from "../svg/profile.js";
// The only coordinate conversion: mathematical (x,y,z) -> engine (x, z*s, -y).
export const toWorld = (p, verticalScale = 1) =>
  new THREE.Vector3(p[0], p[2] * verticalScale, -p[1]);
const colors = {
  surface: 0x58788e,
  grid: 0x7895a8,
  curve: 0xe3a15c,
  ink: 0xd1d3d1,
  x: 0x50f2d4,
  y: 0xc7a7ff,
};
function disposeGroup(group) {
  while (group.children.length) {
    const child = group.children[0];
    group.remove(child);
    child.traverse((o) => {
      o.geometry?.dispose();
      if (o.material)
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          m.dispose();
    });
  }
}
export function createSurface(host, model) {
  let current = model;
  const cylinder = model.periodic;
  const scale = cylinder ? 1 : 0.48;
  const bounds = cylinder ? [-1.5, 1.5, -1.5, 1.5] : [-0.3, 4.5, -0.2, 3.8];
  const floor = cylinder ? -2.8 : -7.5,
    ceil = cylinder ? 3.2 : 5.6;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch {
    return createFallback(host, model, scale);
  }
  renderer.setClearColor(0x1c2023);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.append(renderer.domElement);
  renderer.domElement.setAttribute(
    "aria-label",
    cylinder
      ? "Поверхность и вертикальный цилиндр. Вращение мышью; точка управляется отдельным ползунком."
      : "Параболоид и вертикальное ограничение. Вращение мышью; точка управляется отдельным ползунком.",
  );
  renderer.domElement.setAttribute("role", "img");
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.minZoom = 0.65;
  controls.maxZoom = 2.4;
  controls.maxPolarAngle = Math.PI * 0.88;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
  scene.add(new THREE.AmbientLight(0xffffff, 2.1));
  const light = new THREE.DirectionalLight(0xe0e7eb, 2.4);
  light.position.set(-3, 9, 6);
  scene.add(light);
  const surface = new THREE.Group(),
    constraint = new THREE.Group(),
    pathGroup = new THREE.Group(),
    sections = new THREE.Group(),
    candidates = new THREE.Group();
  scene.add(surface, constraint, pathGroup, sections, candidates);
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(cylinder ? 0.065 : 0.105, 20, 16),
    new THREE.MeshBasicMaterial({
      color: colors.curve,
      depthTest: false,
      transparent: true,
    }),
  );
  marker.renderOrder = 8;
  scene.add(marker);
  const baseMarker = new THREE.Mesh(
    new THREE.SphereGeometry(cylinder ? 0.035 : 0.06, 12, 10),
    new THREE.MeshBasicMaterial({ color: colors.curve }),
  );
  scene.add(baseMarker);
  const heightLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]),
    new THREE.LineDashedMaterial({
      color: colors.curve,
      dashSize: 0.1,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.65,
    }),
  );
  scene.add(heightLine);
  const world = (p) => toWorld(p, scale);
  function line(points, color, width = 1, group = scene, opacity = 1) {
    if (group === sections && width >= 3 && points.length >= 2) {
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points.map(world)),
          Math.max(12, points.length - 1),
          0.018,
          6,
          false,
        ),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          depthTest: false,
        }),
      );
      tube.renderOrder = 7;
      group.add(tube);
      return tube;
    }
    const obj = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points.map(world)),
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthTest: group !== sections,
      }),
    );
    if (group === sections) obj.renderOrder = 7;
    group.add(obj);
    return obj;
  }
  function label(text, p, color = "#b0b5b7") {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext("2d");
    ctx.fillStyle = color;
    ctx.font = "26px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(text, 128, 42);
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        depthTest: false,
        transparent: true,
      }),
    );
    sprite.position.copy(world(p));
    sprite.scale.set(cylinder ? 1.28 : 2.1, cylinder ? 0.32 : 0.525, 1);
    sprite.renderOrder = 9;
    scene.add(sprite);
    return sprite;
  }
  const [xmin, xmax, ymin, ymax] = bounds;
  const origin = cylinder ? [-1.4, -1.4, floor] : [0, 0, floor];
  line([origin, [xmax + 0.3, origin[1], floor]], colors.ink);
  line([origin, [origin[0], ymax + 0.3, floor]], colors.ink);
  line([origin, [origin[0], origin[1], ceil]], colors.ink);
  label("x", [xmax + 0.35, origin[1], floor]);
  label("y", [origin[0], ymax + 0.4, floor]);
  label("z", [origin[0], origin[1], ceil + 0.25]);
  for (let z = Math.ceil(floor); z < ceil; z += cylinder ? 1 : 2) {
    line(
      [
        [origin[0] - 0.07, origin[1], z],
        [origin[0] + 0.07, origin[1], z],
      ],
      0x68757b,
    );
    label(String(z), [origin[0] - 0.25, origin[1], z]);
  }
  function buildSurface() {
    disposeGroup(surface);
    disposeGroup(pathGroup);
    disposeGroup(candidates);
    const positions = [];
    const focusedPatch = current.id === "counterexample";
    // The previous full square emphasized the radial quadratic term rather
    // than the sign-changing constrained profile. Show the exact SAME f_alt,
    // but only on an annular neighborhood of the admissible circle. This
    // reveals the inflection more clearly; no vertical exaggeration or
    // subtraction of an off-constraint term is applied.
    if (focusedPatch) {
      const radialSteps = 18, angularSteps = 144;
      const patch = (i, j) => {
        const radius = 0.72 + (0.56 * i) / radialSteps;
        const angle = (2 * Math.PI * j) / angularSteps;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        return [x, y, current.f(x, y)];
      };
      for (let i = 0; i < radialSteps; i++)
        for (let j = 0; j < angularSteps; j++) {
          const a = patch(i, j), b = patch(i + 1, j),
            c = patch(i + 1, j + 1), d = patch(i, j + 1);
          for (const triangle of [[a, b, d], [b, c, d]])
            for (const vertex of triangle) positions.push(...world(vertex).toArray());
        }
    } else {
      const n = 64;
      const p = (i, j) => {
        const x = xmin + ((xmax - xmin) * i) / n;
        const y = ymin + ((ymax - ymin) * j) / n;
        return [x, y, current.f(x, y)];
      };
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const a = p(i, j), b = p(i + 1, j),
            c = p(i + 1, j + 1), d = p(i, j + 1);
          for (const triangle of [[a, b, d], [b, c, d]])
            if (triangle.every(v => v[2] >= floor && v[2] <= ceil))
              for (const vertex of triangle) positions.push(...world(vertex).toArray());
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.computeVertexNormals();
    surface.add(
      new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: colors.surface,
          side: THREE.DoubleSide,
          roughness: 1,
          metalness: 0,
          transparent: true,
          opacity: 0.72,
          depthWrite: false,
        }),
      ),
    );
    if (focusedPatch) {
      for (const radius of [0.76, 0.88, 1, 1.12, 1.24]) {
        const ring = Array.from({ length: 145 }, (_, j) => {
          const angle = (j * Math.PI) / 72;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          return [x, y, current.f(x, y) + 0.007];
        });
        line(ring, colors.grid, 1, surface, 0.35);
      }
      for (let j = 0; j < 16; j++) {
        const angle = (j * Math.PI) / 8;
        const spoke = Array.from({ length: 41 }, (_, i) => {
          const radius = 0.72 + (i * 0.56) / 40;
          const x = radius * Math.cos(angle), y = radius * Math.sin(angle);
          return [x, y, current.f(x, y) + 0.007];
        });
        line(spoke, colors.grid, 1, surface, 0.25);
      }
    } else {
    for (let j = 0; j <= 16; j++)
      for (const direction of [0, 1]) {
        let run = [];
        for (let i = 0; i <= 80; i++) {
          const x = direction
              ? xmin + ((xmax - xmin) * j) / 16
              : xmin + ((xmax - xmin) * i) / 80,
            y = direction
              ? ymin + ((ymax - ymin) * i) / 80
              : ymin + ((ymax - ymin) * j) / 16,
            z = current.f(x, y);
          if (z >= floor && z <= ceil) run.push([x, y, z + 0.007]);
          else if (run.length) {
            line(run, colors.grid, 1, surface, 0.3);
            run = [];
          }
        }
        if (run.length) line(run, colors.grid, 1, surface, 0.3);
      }
    }
    const points = Array.from({ length: 241 }, (_, i) => {
      const t =
        current.domain[0] + (i * (current.domain[1] - current.domain[0])) / 240;
      const [x, y] = current.r(t);
      return world([x, y, current.h(t)]);
    });
    const tube = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      240,
      cylinder ? 0.022 : 0.035,
      6,
      false,
    );
    const trajectory = new THREE.Mesh(
      tube,
      new THREE.MeshBasicMaterial({
        color: colors.curve,
        depthTest: false,
        transparent: true,
      }),
    );
    trajectory.renderOrder = 6;
    pathGroup.add(trajectory);
    for (const c of current.critical) {
      const point = new THREE.Mesh(
        new THREE.SphereGeometry(cylinder ? 0.047 : 0.08, 12, 10),
        new THREE.MeshBasicMaterial({
          color: 0xf3d1a6,
          depthTest: false,
          transparent: true,
        }),
      );
      point.renderOrder = 7;
      point.position.copy(world([...c.point, c.height]));
      candidates.add(point);
    }
  }
  function plane(points, group, color, opacity = 0.1) {
    const geo = new THREE.BufferGeometry();
    const verts = [
      points[0],
      points[1],
      points[2],
      points[0],
      points[2],
      points[3],
    ].flatMap((p) => world(p).toArray());
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();
    group.add(
      new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      ),
    );
  }
  if (cylinder) {
    for (let i = 0; i < 32; i++) {
      const t = (i * 2 * Math.PI) / 32,
        [x, y] = current.r(t);
      line(
        [
          [x, y, floor],
          [x, y, ceil],
        ],
        colors.curve,
        1,
        constraint,
        0.18,
      );
    }
    for (const z of [floor, ceil])
      line(
        Array.from({ length: 101 }, (_, i) => [
          Math.cos((i * Math.PI) / 50),
          Math.sin((i * Math.PI) / 50),
          z,
        ]),
        colors.curve,
        1,
        constraint,
        0.45,
      );
  } else {
    plane(
      [
        [0, 3, floor],
        [3, 0, floor],
        [3, 0, ceil],
        [0, 3, ceil],
      ],
      constraint,
      colors.curve,
      0.075,
    );
    const vertex = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xe7e3da }),
    );
    vertex.position.copy(world([3, 2, 5]));
    scene.add(vertex);
    label("(3, 2), f = 5", [3, 2, 5.7], "#e7e3da");
  }
  buildSurface();
  let active = true,
    latest,
    degradedView = null;
  function render() {
    if (active && !degradedView) {
      renderer.render(scene, camera);
      host.dataset.rendered = "true";
    }
  }
  function setView(preset = "surface") {
    const focus = cylinder ? [0, 0, 0.1] : [2, 1.6, -0.4];
    const views = cylinder
      ? { surface: [5, 4.4, 6], section: [7, 2.5, 0.5], top: [0.05, 12, 0.05] }
      : { surface: [9, 7.2, -10], section: [11, 4.5, -1], top: [2.05, 16, -1.65] };
    controls.target.copy(world(focus));
    camera.position.set(...(views[preset] || views.surface));
    camera.zoom = cylinder ? 1.12 : preset === "section" ? 1.06 : 1;
    camera.lookAt(controls.target);
    controls.update();
    render();
  }
  function resetCamera() { setView("surface"); }
  const resize = new ResizeObserver(() => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    const span = cylinder ? 3.85 : 4.65;
    camera.left = (-span * width) / height;
    camera.right = (span * width) / height;
    camera.top = span;
    camera.bottom = -span;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  });
  resize.observe(host);
  controls.addEventListener("change", render);
  resetCamera();
  const observer = new IntersectionObserver(
    (entries) => {
      active = entries[0].isIntersecting;
      if (active) render();
    },
    { rootMargin: "120px" },
  );
  observer.observe(host);
  function updateSections(s) {
    disposeGroup(sections);
    if (!s.sections) return;
    const [x, y] = s.math.point,
      z = s.math.height,
      [fx, fy] = s.math.gradient;
    if (s.sectionMode !== "y") plane(
      [
        [xmin, y, floor],
        [xmax, y, floor],
        [xmax, y, ceil],
        [xmin, y, ceil],
      ],
      sections,
      colors.x,
      0.095,
    );
    if (s.sectionMode !== "x") plane(
      [
        [x, ymin, floor],
        [x, ymax, floor],
        [x, ymax, ceil],
        [x, ymin, ceil],
      ],
      sections,
      colors.y,
      0.095,
    );
    for (const axis of [0, 1].filter(a => s.sectionMode === "both" || (a === 0 ? s.sectionMode === "x" : s.sectionMode === "y"))) {
      let points = [];
      for (let i = 0; i <= 100; i++) {
        const a = axis ? x : xmin + ((xmax - xmin) * i) / 100,
          b = axis ? ymin + ((ymax - ymin) * i) / 100 : y;
        const h = current.f(a, b);
        if (h >= floor && h <= ceil) points.push([a, b, h + 0.025]);
      }
      line(points, axis ? colors.y : colors.x, 3, sections);
    }
    const length = 0.6;
    line(
      [
        [x - length, y, z - fx * length],
        [x + length, y, z + fx * length],
      ],
      colors.x,
      3,
      sections,
    );
    line(
      [
        [x, y - length, z - fy * length],
        [x, y + length, z + fy * length],
      ],
      colors.y,
      3,
      sections,
    );
    for (const [vector, color] of [
      ...(s.sectionMode !== "y" ? [[[1, 0, fx], colors.x]] : []),
      ...(s.sectionMode !== "x" ? [[[0, 1, fy], colors.y]] : []),
    ]) {
      const direction = world(vector).normalize();
      const arrow = new THREE.ArrowHelper(
          direction,
          world([x, y, z]),
          0.92,
          color,
          0.25,
          0.145,
        );
      for (const part of [arrow.line, arrow.cone]) {
        part.material.transparent = true;
        part.material.depthTest = false;
        part.renderOrder = 8;
      }
      sections.add(arrow);
    }
  }
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    renderer.domElement.hidden = true;
    degradedView = createFallback(host, current, scale);
    if (latest) degradedView.update(latest);
    host.dataset.webgl = "lost";
  });
  host.dataset.webgl = "ready";
  return {
    resetCamera,
    setView,
    update(s) {
      latest = s;
      if (degradedView) {
        degradedView.update(s);
        return;
      }
      if (current !== s.model) {
        current = s.model;
        buildSurface();
      }
      marker.position.copy(world(s.math.position));
      baseMarker.position.copy(world([...s.math.point, floor]));
      heightLine.geometry.setFromPoints([
        world([...s.math.point, floor]),
        world(s.math.position),
      ]);
      heightLine.computeLineDistances();
      constraint.visible = cylinder || s.plane;
      pathGroup.visible = cylinder || s.plane;
      marker.visible = cylinder || s.plane;
      baseMarker.visible = marker.visible;
      heightLine.visible = marker.visible;
      candidates.visible = s.candidates;
      updateSections(s);
      host.dataset.surfaceDomain = current.id === "counterexample" ? "annular-neighborhood" : "rectangular";
      host.dataset.position = JSON.stringify(s.math.position);
      render();
    },
  };
}
function createFallback(host, initial, verticalScale) {
  host.dataset.webgl = "fallback";
  host.querySelector('.world-note').textContent='Схематический вид без вращения. Точные значения — в профиле.';
  host.closest('.scene').querySelector('[data-action=camera]').disabled=true;
  const notice = document.createElement("p");
  notice.className = "fallback-note";
  notice.textContent =
    "WebGL недоступен. Схематическая проекция; профиль и управление работают.";
  host.append(notice);
  const svg = svgElement("svg", {
    viewBox: "0 0 600 420",
    class: "fallback",
    role: "img",
    "aria-label":
      "Схематическое пространственное представление поверхности и допустимой траектории",
  });
  host.append(svg);
  const project = ([x, y, z]) =>
    initial.periodic
      ? [300 + 90 * (x - y * 0.55), 250 - 65 * (z * 0.8 + y * 0.65)]
      : [250 + 65 * (x - y * 0.55), 290 - 37 * (z * 0.45 + y * 0.8)];
  const path = (points) =>
    points.map((p, i) => `${i ? "L" : "M"}${project(p).join(",")}`).join(" ");
  return {
    resetCamera() {},
    setView() {},
    update(s) {
      svg.replaceChildren();
      const m = s.model,
        range = m.periodic ? [-1.4, 1.4] : [0, 4];
      for (let j = 0; j <= 10; j++)
        for (const axis of [0, 1]) {
          const ps = [];
          for (let i = 0; i <= 60; i++) {
            const a = range[0] + ((range[1] - range[0]) * i) / 60,
              b = range[0] + ((range[1] - range[0]) * j) / 10,
              x = axis ? a : b,
              y = axis ? b : a,
              z = m.f(x, y);
            if (z >= -7.5 && z <= 6) ps.push([x, y, z]);
          }
          svg.append(
            svgElement("path", {
              d: path(ps),
              stroke: "#8faec5",
              opacity: 0.4,
            }),
          );
        }
      if (m.periodic || s.plane) {
        const floor=m.periodic?-2.8:-7.5,ceil=m.periodic?3.2:5.6;
        const wire=(points)=>svg.append(svgElement('path',{d:path(points),stroke:'#e3a15c',opacity:.35}));
        if(m.periodic){
          for(const z of [floor,ceil])wire(Array.from({length:81},(_,i)=>[Math.cos(i*Math.PI/40),Math.sin(i*Math.PI/40),z]));
          for(let i=0;i<12;i++){const a=i*Math.PI/6;wire([[Math.cos(a),Math.sin(a),floor],[Math.cos(a),Math.sin(a),ceil]]);}
        }else wire([[0,3,floor],[3,0,floor],[3,0,ceil],[0,3,ceil],[0,3,floor]]);
        const ps = Array.from({ length: 121 }, (_, i) => {
          const t = m.domain[0] + ((m.domain[1] - m.domain[0]) * i) / 120;
          return [...m.r(t), m.h(t)];
        });
        svg.append(
          svgElement("path", {
            d: path(ps),
            stroke: "#e3a15c",
            "stroke-width": 3,
          }),
        );
        const [cx, cy] = project(s.math.position);
        svg.append(svgElement("circle", { cx, cy, r: 6, fill: "#e3a15c" }));
      }
      if(s.sections){
        const [x,y]=s.math.point,z=s.math.height,[fx,fy]=s.math.gradient;
        for(const [axis,color]of[[0,'#47e1c2'],[1,'#c29aff']].filter(([axis]) => s.sectionMode === 'both' || (axis === 0 ? s.sectionMode === 'x' : s.sectionMode === 'y'))){
          const points=Array.from({length:61},(_,i)=>{const a=i/15;const p=axis?[x,a]:[a,y];return [...p,m.f(...p)];}).filter(p=>p[2]>=-7.5);
          svg.append(svgElement('path',{d:path(points),stroke:color}));
        }
        for(const [points,color]of[[[[x-.5,y,z-fx*.5],[x+.5,y,z+fx*.5]],'#47e1c2'],[[[x,y-.5,z-fy*.5],[x,y+.5,z+fy*.5]],'#c29aff']].filter((_,axis) => s.sectionMode === 'both' || (axis === 0 ? s.sectionMode === 'x' : s.sectionMode === 'y')))svg.append(svgElement('path',{d:path(points),stroke:color}));
      }
      host.dataset.position = JSON.stringify(s.math.position);
      host.dataset.rendered = "true";
    },
  };
}
