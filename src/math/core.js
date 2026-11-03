export const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
export const norm = a => Math.hypot(...a);
export const scale = (v, k) => v.map(x => x * k);
export const unit = v => norm(v) > 1e-12 ? scale(v, 1 / norm(v)) : v.map(() => 0);
export function project(v, onto) {
  const d = dot(onto, onto);
  return d > 1e-24 ? scale(onto, dot(v, onto) / d) : onto.map(() => 0);
}
export const wrap = t => ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
export const clamp = (t, a, b) => Math.max(a, Math.min(b, t));

export function evaluate(model, t) {
  const point = model.r(t), tangent = model.tangent(t);
  const gradient = model.gradient(...point), normal = model.normal(...point);
  const height = model.f(...point), derivative = dot(gradient, tangent);
  const projection = project(gradient, tangent);
  const stationary = Math.abs(derivative) < 1e-9;
  const regular = norm(normal) > 1e-12 && norm(tangent) > 1e-12;
  return {
    t, point, tangent, gradient, normal, height, derivative, projection,
    unitDerivative: norm(tangent) > 1e-12 ? derivative / norm(tangent) : null,
    position: [...point, height], regular, stationary,
    // A multiplier is meaningful only at a regular stationary point.
    lambda: stationary && regular ? dot(gradient, normal) / dot(normal, normal) : null
  };
}
