export const distance = {
  f: (x, y) => (x - 3) ** 2 + (y - 3) ** 2,
  g: (x, y) => x + 2 * y,
  gradient: (x, y) => [2 * (x - 3), 2 * (y - 3)],
  normal: () => [1, 2],
  optimum: [16 / 5, 17 / 5]
};
