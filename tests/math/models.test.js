import { describe, test, expect } from "vitest";
import {
  dot,
  norm,
  project,
  evaluate,
  unit,
  wrap,
  angleBetween,
} from "../../src/math/core.js";
import { paraboloid as main } from "../../src/math/examples/paraboloid.js";
import { cylinder } from "../../src/math/examples/cylinder.js";
import { counterexample } from "../../src/math/examples/counterexample.js";
import { distance } from "../../src/math/examples/distance.js";
import { createStore } from "../../src/state/sceneStore.js";
const vectorClose = (a, b) =>
  a.forEach((x, i) => expect(x).toBeCloseTo(b[i], 11));

describe("independent exact reference values", () => {
  test.each([
    [1, [1, 2], [4, 0], 1, 4, [2, -2], Math.PI / 4],
    [
      5 / 3,
      [5 / 3, 4 / 3],
      [8 / 3, 8 / 3],
      7 / 3,
      0,
      [0, 0],
      Math.PI / 2,
    ],
    [2, [2, 1], [2, 4], 2, -2, [-1, 1], Math.acos(-1 / Math.sqrt(10))],
  ])("main t=%s", (t, p, gf, z, derivative, projection, angle) => {
    const s = evaluate(main, t);
    vectorClose(s.point, p);
    vectorClose(s.gradient, gf);
    vectorClose(s.projection, projection);
    expect(s.height).toBeCloseTo(z, 12);
    expect(s.derivative).toBeCloseTo(derivative, 12);
    expect(s.unitDerivative).toBeCloseTo(derivative / Math.sqrt(2), 12);
    expect(s.projectionCoefficient).toBeCloseTo(derivative / 2, 12);
    expect(s.projectionNorm).toBeCloseTo(Math.abs(derivative) / Math.sqrt(2), 12);
    expect(s.angle).toBeCloseTo(angle, 12);
    expect(main.ddh(t)).toBe(-6);
  });
  test("maximum gradient is nonzero, multiplier exists only at stationary points", () => {
    expect(evaluate(main, 5 / 3).lambda).toBeCloseTo(8 / 3, 12);
    expect(norm(evaluate(main, 5 / 3).gradient)).toBeCloseTo(
      (8 * Math.sqrt(2)) / 3,
      12,
    );
    expect(evaluate(main, 1).lambda).toBeNull();
  });
  test.each([
    [0, [1, 0], 2, 1.5, -5],
    [Math.PI, [-1, 0], 0, 0.5, -3],
    [Math.acos(-0.25), [-0.25, Math.sqrt(15) / 4], -1.125, -1, 3.75],
    [
      2 * Math.PI - Math.acos(-0.25),
      [-0.25, -Math.sqrt(15) / 4],
      -1.125,
      -1,
      3.75,
    ],
  ])("cylinder t=%s", (t, p, z, lambda, second) => {
    const s = evaluate(cylinder, t);
    vectorClose(s.point, p);
    expect(s.height).toBeCloseTo(z, 12);
    expect(s.derivative).toBeCloseTo(0, 12);
    expect(s.lambda).toBeCloseTo(lambda, 12);
    expect(cylinder.ddh(t)).toBeCloseTo(second, 12);
    vectorClose(
      s.gradient,
      s.normal.map((x) => x * lambda),
    );
    if (lambda < 0) expect(dot(s.gradient, s.normal)).toBeLessThan(0);
  });
  test("stationary counterexample crosses zero on both sides", () => {
    const s = evaluate(counterexample, 0);
    vectorClose(s.gradient, [0, 0]);
    expect(s.lambda).toBe(0);
    for (const e of [0.1, 0.001, 0.00001]) {
      expect(counterexample.h(e)).toBeGreaterThan(0);
      expect(counterexample.h(-e)).toBeLessThan(0);
    }
  });
  test("distance optimum and irregular constraint", () => {
    expect(distance.g(16 / 5, 17 / 5)).toBe(10);
    expect(distance.f(16 / 5, 17 / 5)).toBeCloseTo(1 / 5, 12);
    vectorClose(distance.gradient(16 / 5, 17 / 5), [2 / 5, 4 / 5]);
    const irregular = {
      r: () => [0, 0],
      tangent: () => [0, 0],
      f: (x) => x,
      gradient: () => [1, 0],
      normal: () => [0, 0],
    };
    expect(evaluate(irregular, 0).regular).toBe(false);
    expect(evaluate(irregular, 0).lambda).toBeNull();
    expect(evaluate(irregular, 0).unitDerivative).toBeNull();
  });
});
for (const model of [main, cylinder, counterexample]) {
  test(`${model.id}: constraint, chain rule, normals, independent finite differences`, () => {
    for (let i = 0; i <= 120; i++) {
      const t = -4 + i / 10,
        s = evaluate(model, t);
      expect(model.g(...s.point)).toBeCloseTo(model.c, 11);
      expect(model.h(t)).toBeCloseTo(s.height, 10);
      expect(model.dh(t)).toBeCloseTo(s.derivative, 10);
      expect(dot(s.normal, s.tangent)).toBeCloseTo(0, 11);
      expect(dot(s.projection, s.tangent)).toBeCloseTo(s.derivative, 10);
      const e = 1e-5;
      expect((model.h(t + e) - model.h(t - e)) / (2 * e)).toBeCloseTo(
        s.derivative,
        6,
      );
    }
  });
}
test("zero vectors stay finite and periodic seam is continuous", () => {
  expect(project([0, 0], [1, -1])).toEqual([0, -0]);
  expect(unit([0, 0])).toEqual([0, 0]);
  expect(angleBetween([0, 0], [1, 0])).toBeNull();
  expect(wrap(2 * Math.PI)).toBe(0);
  expect(wrap(-Number.EPSILON)).toBe(0);
  vectorClose(cylinder.r(wrap(-1e-6)), cylinder.r(-1e-6));
});
test("scene stores isolate state and reset all layers", () => {
  const first = createStore(main),
    second = createStore(main),
    third = createStore(cylinder);
  first.set({ t: 5 / 3, step: 2, sections: true });
  expect(second.get().t).toBe(1);
  first.reset();
  expect(first.get().t).toBe(1);
  expect(first.get().sections).toBe(false);
  third.useModel(counterexample);
  expect(third.get().model.id).toBe("counterexample");
  third.reset();
  expect(third.get().model.id).toBe("cylinder");
  expect(third.get().t).toBe(Math.PI);
});
test("analytic level ellipses have the stated height and tangent at optimum", () => {
  for (const height of [-10, -5, 1, 7 / 3, 4]) {
    const { center, radii } = main.levelSet(height);
    for (let i = 0; i < 48; i++) {
      const angle = (i * Math.PI) / 24;
      expect(
        main.f(
          center[0] + radii[0] * Math.cos(angle),
          center[1] + radii[1] * Math.sin(angle),
        ),
      ).toBeCloseTo(height, 11);
    }
  }
});
