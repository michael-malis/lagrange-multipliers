const a = Math.acos(-1 / 4);
export const cylinder = {
  id: 'cylinder', domain: [0, 2 * Math.PI], initial: Math.PI, c: 1, periodic: true,
  f: (x, y) => x + x * x - y * y,
  g: (x, y) => x * x + y * y,
  r: t => [Math.cos(t), Math.sin(t)],
  tangent: t => [-Math.sin(t), Math.cos(t)],
  gradient: (x, y) => [1 + 2 * x, -2 * y],
  normal: (x, y) => [2 * x, 2 * y],
  h: t => Math.cos(t) + Math.cos(2 * t),
  dh: t => -Math.sin(t) * (1 + 4 * Math.cos(t)),
  ddh: t => -Math.cos(t) - 4 * Math.cos(2 * t),
  critical: [
    { t: 0, point: [1, 0], height: 2, lambda: 1.5, kind: 'Глобальный максимум' },
    { t: a, point: [-.25, Math.sqrt(15) / 4], height: -9 / 8, lambda: -1, kind: 'Глобальный минимум' },
    { t: Math.PI, point: [-1, 0], height: 0, lambda: .5, kind: 'Локальный максимум' },
    { t: 2 * Math.PI - a, point: [-.25, -Math.sqrt(15) / 4], height: -9 / 8, lambda: -1, kind: 'Глобальный минимум' }
  ]
};
