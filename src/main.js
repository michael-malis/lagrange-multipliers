import "katex/dist/katex.min.css";
import "./ui/styles.css";
import { opening, ending } from "./content/lesson.js";
import { renderMath } from "./ui/format.js";
import { SurfaceScene } from "./scenes/SurfaceScene.js";
import { geometry } from "./content/proof.js";
import { GradientScene } from "./scenes/GradientScene.js";
import { application } from "./content/application.js";
import { CylinderScene } from "./scenes/CylinderScene.js";
document.querySelector("#app").innerHTML =
  opening + geometry + application + ending;
renderMath();
SurfaceScene(document.querySelector("#scene-one"));
GradientScene(document.querySelector("#scene-two"));
CylinderScene(document.querySelector("#scene-three"));
document.documentElement.dataset.build = __BUILD_ID__;
document.querySelector("#build-id").textContent = __BUILD_ID__.slice(0, 7);
