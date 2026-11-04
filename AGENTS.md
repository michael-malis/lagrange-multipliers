# Repository guidance (v2.0)

- Read `docs/UPGRADE_SPEC.md` first. It supersedes conflicting pedagogical and design instructions in the historical `docs/SPEC.md`, which must remain unchanged.
- Use `TASKS.md` for the six-phase implementation plan and validation ledger; only check an item after implementing **and** verifying it. Add regression tasks if bugs appear.
- Preserve the existing three interactive scenes, Russian mathematical terminology, self-contained `file://` production HTML, and GitHub Pages URL.
- The learning sequence begins with the constrained problem and a direct substitution, proceeds through parameterization and its limitations, then derives the Lagrange condition. Do not introduce the formula in the hero.
- Keep objectives and restrictions distinct: `f=ℓ` is an objective level, `g=c` is the constraint. Display rational math with KaTeX vertical fractions.
- The paraboloid views share one parameter and mathematical state; cameras, projection stages, and display preferences are distinct. The circle example uses the strengthened nonzero-gradient counterexample. Its focused profile is the primary interactive SVG, not a static duplicate; when plotting negative t near 0, wrap to 2π for the shared store. The 3D crop shows the exact f_alt on a filled disk of radius 1.28 (no annular hole), including the WebGL fallback. Clip rectangular paraboloid triangles against the floor/ceil z slab instead of dropping entire triangles. Ensure any nonlocal point selection leaves the focused profile and switches to a full-period view.
- After each verified change update `TASKS.md` and commit. After each phase run math/interaction/offline tests, save screenshots, and document findings in `docs/QA.md`.
- Required verification: `npm test`, `npm run build`, `npm run test:browser`, offline WebGL fallback, responsive layout, accessibility, actual deployment action, and a direct published-site check.
- Never interpret a successful commit or build as proof of correct published behavior; never mark an unexecuted test or unavailable skill as passed. Do not force-push unrelated work.

- Do not reintroduce optional quiz blocks removed by owner instruction on 2026-11-04. A constrained stationary inflection is not a saddle point of the ambient f when its gradient is nonzero.
