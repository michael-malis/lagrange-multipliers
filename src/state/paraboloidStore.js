import { paraboloid } from "../math/examples/paraboloid.js";
import { createStore } from "./sceneStore.js";

// The 3D surface and level-set views describe the same constrained point.
// Camera controls remain local to their individual renderers.
export const paraboloidStore = createStore(paraboloid, { plane: false });
