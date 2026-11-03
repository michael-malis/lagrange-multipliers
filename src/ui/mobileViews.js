// Narrow-screen geometry/profile switch. Both views keep the same live model.
export function initMobileViews() {
  for (const id of ["one", "two", "three"]) {
    const scene = document.querySelector("#scene-" + id);
    const top = scene?.querySelector(".scene-top");
    if (!top) continue;
    const toolbar = document.createElement("div");
    toolbar.className = "mobile-view-toggle";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", "Переключить математическую геометрию и профиль высоты");
    const labels = [["geometry", "Геометрия"], ["profile", "Профиль высоты"]];
    for (const [key, label] of labels) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.mobileViewButton = key;
      button.setAttribute("aria-pressed", String(key === "geometry"));
      button.addEventListener("click", () => {
        scene.dataset.mobileView = key;
        toolbar.querySelectorAll("button").forEach(b => b.setAttribute(
          "aria-pressed", String(b.dataset.mobileViewButton === key)
        ));
      });
      toolbar.append(button);
    }
    scene.dataset.mobileView = "geometry";
    top.insertAdjacentElement("afterend", toolbar);
  }
}
