import { cylinder } from './cylinder.js';
export const counterexample = {
  ...cylinder, id: 'counterexample', initial: 0,
  f: (x, y) => y ** 3,
  gradient: (x, y) => [0, 3 * y * y],
  h: t => Math.sin(t) ** 3,
  dh: t => 3 * Math.sin(t) ** 2 * Math.cos(t),
  ddh: t => 6 * Math.sin(t) * Math.cos(t) ** 2 - 3 * Math.sin(t) ** 3,
  critical: [
    { t: 0, point: [1, 0], height: 0, lambda: 0, kind: 'Стационарная точка без экстремума' },
    { t: Math.PI / 2, point: [0, 1], height: 1, lambda: 1.5, kind: 'Глобальный максимум' },
    { t: Math.PI, point: [-1, 0], height: 0, lambda: 0, kind: 'Стационарная точка без экстремума' },
    { t: 3 * Math.PI / 2, point: [0, -1], height: -1, lambda: -1.5, kind: 'Глобальный минимум' }
  ]
};
