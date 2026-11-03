import { evaluate, clamp, wrap } from "../math/core.js";
export function createStore(model, extra = {}) {
  const initial = {
    t: model.initial,
    step: 0,
    sections: false,
    candidates: false,
    ...extra,
  };
  let state = { ...initial },
    currentModel = model;
  const listeners = new Set();
  const snapshot = () => ({
    ...state,
    model: currentModel,
    math: evaluate(currentModel, state.t),
  });
  const emit = () => {
    const value = snapshot();
    listeners.forEach((fn) => fn(value));
  };
  return {
    get: snapshot,
    set(patch) {
      state = { ...state, ...patch };
      state.t = currentModel.periodic
        ? wrap(state.t)
        : clamp(state.t, ...currentModel.domain);
      emit();
    },
    useModel(next) {
      currentModel = next;
      state = { ...state, t: next.initial };
      emit();
    },
    reset() {
      currentModel = model;
      state = { ...initial };
      emit();
    },
    subscribe(fn) {
      listeners.add(fn);
      fn(snapshot());
      return () => listeners.delete(fn);
    },
  };
}
