export const paraboloid = {
  id: "paraboloid",
  domain: [0, 3],
  initial: 1,
  c: 3,
  f: (x, y) => 5 - (x - 3) ** 2 - 2 * (y - 2) ** 2,
  g: (x, y) => x + y,
  r: (t) => [t, 3 - t],
  tangent: () => [1, -1],
  gradient: (x, y) => [-2 * (x - 3), -4 * (y - 2)],
  normal: () => [1, 1],
  h: (t) => -3 * t * t + 10 * t - 6,
  dh: (t) => 10 - 6 * t,
  ddh: () => -6,
  levelSet: (value) => ({
    center: [3, 2],
    radii: [
      Math.sqrt(Math.max(0, 5 - value)),
      Math.sqrt(Math.max(0, (5 - value) / 2)),
    ],
  }),
  critical: [
    {
      t: 5 / 3,
      point: [5 / 3, 4 / 3],
      height: 7 / 3,
      lambda: 8 / 3,
      kind: "Единственный глобальный максимум",
    },
  ],
};
