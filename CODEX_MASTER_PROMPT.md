# CODEX MASTER PROMPT — Lagrange Multipliers

**Execution brief · one autonomous task · six sequential phases**

## 0. Your assignment

You are the implementation agent for an existing GitHub repository:

- Repository: `michael-malis/lagrange-multipliers`
- Target public site: `https://michael-malis.github.io/lagrange-multipliers/`
- Primary branch: `main`
- Product: **one Russian-language, single-page, interactive mathematical article** explaining constrained optimization with Lagrange multipliers.
- Other required distribution: **the same fully self-contained `dist/index.html` must run directly via `file://`, offline and without companion assets**.

**Complete all six phases in this one assignment.** Do not treat this as a phase-1-only task. Do not wait for the user to send six further prompts. Internally use milestones, test gates, and durable progress records; proceed automatically to the next phase after a gate passes. If a genuine external permission or GitHub configuration block arises, finish all independent work and accurately report what requires human action.

The GitHub repository has already been created. **Do not create another repository, rename this one, overwrite its history, or force-push.** Inspect its current state first.

## 1. Sources of truth and precedence

1. Read `docs/SPEC.md` completely. This is the authoritative **mathematical, educational, UI, and deployment specification** (v1.1 or newer).
2. This `CODEX_MASTER_PROMPT.md` controls **the execution strategy**: one run, six sequential phases, verification, persistence, and delivery.
3. Root `AGENTS.md`, if present, contains local repository conventions; create or refine it early and keep it short.
4. Derived files `docs/RUN_OF_SHOW.md`, `docs/ACCEPTANCE.md`, and `docs/PHASES.md` detail timing, tests, and milestones. Maintain consistency with `SPEC.md`.

**Resolve the known old-instruction conflict explicitly:** Earlier drafts of the specification included a *sample initial Codex prompt that said “only perform phase 1 and stop”*. That sample is obsolete. Ignore or remove it; the present task explicitly requires phases **1 through 6 in one autonomous execution**. A rule such as “only advance after passing the previous phase's checks” is still valid and means internal verification, **not** mandatory user approval after each phase.

If `docs/SPEC.md` is absent or incomplete, check whether it is available as an attached task file and place it in the repository. If no complete specification is available, do **not invent a replacement** or proceed with mathematics based on a partial outline: report the exact missing input.

For actual substantive discrepancies between `SPEC.md` and the mathematics below, verify analytically, document the discrepancy, and preserve the intended mathematical result rather than silently changing examples.

## 2. Scope, audience, and UX contract

The educational article is for mathematically trained readers, including experienced mathematics educators. Write the **article itself in natural, precise Russian**; avoid elementary hand-holding, hype, and vague popular-science explanations. Never mention the author's father, family relationship, or private motivation in public-facing site text, the repository description, or `README.md`.

**Time constraint:** the main, end-to-end demonstration is planned for **18 minutes** with a **2-minute reserve**; never require more than 20 minutes to traverse the mandatory route. The 18 minutes include speaking, actual interaction, interpretation, and navigation. The article may also contain hidden-by-default optional exploratory material outside that time budget.

Keep exactly **three principal interactive scenes**, with a single coherent geometric proof. Avoid extra large scenes, separate pages, account systems, backend services, arbitrary function solvers, or a framework/router that does not clearly help the project. The final website should behave like a mathematical article with vertical scrolling rather than a dashboard or slideshow.

The central learning chain must be demonstrated *causally*:

1. Constraint restricts admissible movement.
2. Optimize height **along the admissible path**, not the entire surface.
3. Parameterize that path: `h(t) = f(r(t))`.
4. At a regular local constrained extremum, `h'(t) = ∇f(r(t)) · r'(t) = 0`.
5. Because `g(r(t))` is constant, `∇g · r'(t) = 0`.
6. In the regular planar case, both gradients lie in the one-dimensional normal space, so `∇f = λ∇g`.
7. The Lagrangian and its system are consequences of this observation, not unexplained starting formulas.
8. Satisfying first-order equations yields **candidates**, not automatic globally optimal solutions.

Do **not** duplicate the proof in the next text section: after the geometry, move directly to the algorithm and worked example.

### Non-negotiable mathematics

**Main example, scenes I–II:**

\[
f(x,y)=5-(x-3)^2-2(y-2)^2,\qquad g(x,y)=x+y=3.
\]

\[
r(t)=(t,3-t),\quad T=(1,-1),\quad h(t)=-3t^2+10t-6,\quad h'(t)=10-6t.
\]

\[
\nabla f=(-2(x-3),-4(y-2)),\qquad \nabla g=(1,1).
\]

\[
P^*=(5/3,4/3),\quad \lambda=8/3,\quad f(P^*)=7/3,\quad h''(t)=-6.
\]

A useful initial interactive point is `t=1`, `P=(1,2)`, where `∇f=(4,0)` and `h'(1)=4`. The main traversal domain can include `0 ≤ t ≤ 3`. The gradient's projection onto the tangent `T` is

\[
\operatorname{proj}_T \nabla f=\frac{\nabla f\cdot T}{\|T\|^2}T=\frac{h'(t)}{2}(1,-1).
\]

Distinguish `h'(t)` (derivative with respect to `t`) from the directional derivative along the **unit** tangent `T/√2`, which is `h'(t)/√2`. At the conditional maximum, the tangent projection vanishes while `∇f(P*) = (8/3,8/3) ≠ 0`. The result is a unique global maximum along the full admissible line because the restricted profile is strictly concave.

**Cylinder example, scene III:**

\[
f(x,y)=x+x^2-y^2,\quad g(x,y)=x^2+y^2=1.
\]

\[
r(t)=(\cos t,\sin t),\quad h(t)=\cos t+\cos 2t,\quad h'(t)=-\sin t(1+4\cos t).
\]

Four critical **points** on the circle:

| Point | `f` | `λ` | Classification |
|---|---:|---:|---|
| `(1,0)` | `2` | `3/2` | Global maximum |
| `(-1,0)` | `0` | `1/2` | Local, non-global maximum |
| `(-1/4,+√15/4)` | `-9/8` | `-1` | Global minimum |
| `(-1/4,-√15/4)` | `-9/8` | `-1` | Global minimum |

A small **optional** counterexample may switch the one-dimensional profile to `f(x,y)=y^3` on `x²+y²=1`, so `h(t)=sin³t` has a stationary non-extremum at `t=0`. No fourth principal scene.

State the regularity assumption `∇g(P) ≠ 0` for the standard theorem. Do not depict two gradients as necessarily pointing the same way: `λ` can be negative or zero. In SVG views where angle and orthogonality are read geometrically, use equal x/y scale. In 3D, do not confuse `∇f` in the parameter plane with tangent vectors to the surface `z=f(x,y)`.

## 3. Time-coded mandatory route

Follow this allocation from `SPEC.md`:

| Time | Mandatory content |
|---|---|
| `0:00–1:30` | Problem statement; unconstrained optimum is inadmissible |
| `1:30–4:30` | Scene I: 3D surface, vertical constraint plane, intersection, linked 1D profile |
| `4:30–5:30` | Scene I's short coordinate-section mode: partial derivatives |
| `5:30–11:30` | Scene II: tangent movement, derivative, gradient projection, orthogonality, Lagrange condition |
| `11:30–16:00` | Derive computational system, introduce Lagrangian, solve and check globality |
| `16:00–17:30` | Scene III: surface + vertical cylinder, multiple extrema |
| `17:30–18:00` | One final conceptual recap |

Reserve `18:00–20:00` for questions or a slower traversal; do not put new mandatory content there. Create `docs/RUN_OF_SHOW.md` with **specific** question → action → observation → mathematical statement → transition and realistic interaction timings. Any timing claim beyond an authored plan must be labeled as **unverified until a human timed run-through**; automated tests cannot prove comprehension or actual spoken duration.

## 4. Deliverable and architecture

Develop the source modularly, with logical separation of:

- Pure math functions / exact reference values and example models (`src/math/`).
- Per-scene UI state and computed mathematical state (`src/state/`).
- Three.js 3D views and SVG 2D views (`src/scenes/`, `src/graphics/`).
- Russian educational prose, labels, and formula rendering (`src/content/`, `src/ui/`).
- Unit, browser, visual, offline, and deployment checks (`tests/`).
- Deployment workflow (`.github/workflows/deploy.yml`).

Recommended stack: **Vite + vanilla JavaScript ES modules + Three.js + native SVG + KaTeX + Vitest + Playwright**. Avoid React, Next.js, a routing framework, or D3 unless a real need is demonstrated. Use `base: './'` in Vite to support the same self-contained artifact on GitHub Pages and `file://`. Ensure the bundler **actually embeds** all JS, CSS, KaTeX fonts, styles, images/SVG, and other runtime assets. `vite-plugin-singlefile` is a candidate, not a substitute for actual offline tests. Avoid external runtime network requests, CDNs, dynamic chunks, or `fetch()` of assets.

**Exactly one production deployable file:** `dist/index.html`. It must open directly as `file://` without a local server or a companion folder. The **same artifact** is deployed to GitHub Pages. During development, any reasonable modular source files and test artifacts are allowed; do not commit `dist/` to the source branch unless an unavoidable repository rule requires it. Write meaningful `.gitignore` and `README.md` yourself based on the actual implementation; do not ask the user to supply their contents. Include a suitable short description without family/personal references.

Accessibility / usability essentials: adequate contrast; keyboard-operable primary controls; pointer/touch-safe interaction; labels for math objects; deterministic initial camera states; reset buttons; no hidden essential controls; responsive desktop-first layout; disable decorative auto-animation. Re-render only dynamic geometric objects during interaction instead of regenerating entire surfaces. Show math labels and values without jitter. Keep gradient lengths geometrically honest or explicitly indicate visual normalization.

If WebGL fails, preserve access to formulas, texts, and at least a meaningful static fallback for 3D material.

## 5. Autonomous execution policy

**One user request, six internally gated phases.** Begin working, do not merely return a plan. Keep going through the phases as far as technically possible, without asking for a new prompt between them.

- At the start, do a short read-only preflight: verify working repo/root, current branch, clean/dirty state, origin remote, available tools, Node/npm, and specification; preserve existing files and user changes.
- Make a concise execution plan in `docs/PHASES.md` (or update the one already present). Create `docs/PROGRESS.md` to record exact phase status, key design decisions, checks run, failures, and next work. This is a *resume ledger*, not excessive documentation.
- Keep a brief `AGENTS.md` with stable repository guidance. Point to `docs/SPEC.md` and related documents rather than copying the full mathematical specification into it.
- Use a working branch if appropriate for the Codex environment. Make focused, descriptive commits at meaningful milestones if repository write/commit permissions allow. **Never force-push, reset unrelated work, remove existing GitHub configuration unnecessarily, or overwrite existing project files without checking.**
- After each phase: run its checks, repair failures, update `docs/PROGRESS.md`, and **immediately continue** when internal criteria pass.
- Do not get stuck in repeated speculative attempts. Diagnose the root cause; after limited unsuccessful efforts, record an exact blocker and continue independent work.
- Never invent test results, time measurements, deployments, published URLs, browser screenshots, or completed phases.
- If package/network/browser tools are unavailable, use available alternatives, leave explicit unverified items, and still deliver the maximum working result.
- User interaction should be requested only for an unresolvable external blocker: missing credentials/authorization, a protected branch/PR approval, enabling Pages in repository settings, or unavailable essential source specification. Keep the necessary manual step exact and short.

**Important distinction:** A remote GitHub Pages deployment may be blocked pending `main` merge or a user-only repository setting. This must **not** prevent implementation phases 2–5 from proceeding after local phase-1 checks pass. Track "local infrastructure complete" separately from "remote Pages first deployment confirmed" and defer the external verification gate until phase 6. Do not falsely mark Pages as verified.

## 6. Six phases and phase gates

### Phase 1 — Repository foundation, build, and publication pipeline

1. Confirm that `michael-malis/lagrange-multipliers` is the current existing repo.
2. Place/confirm `docs/SPEC.md` and create concise `AGENTS.md`, `README.md`, `.gitignore`, `docs/RUN_OF_SHOW.md`, `docs/ACCEPTANCE.md`, `docs/PHASES.md`, and `docs/PROGRESS.md`.
3. Initialize Vite and modular project folders; generate a lockfile. Pin suitable dependencies without unnecessary extras.
4. Configure a minimal HTML page, a valid build, test scripts, and single-file packaging.
5. Create `.github/workflows/deploy.yml` for pushes to `main` and `workflow_dispatch`. Follow current supported GitHub Pages actions (`checkout`, `setup-node`, `configure-pages`, `upload-pages-artifact`, `deploy-pages`), the `github-pages` environment, `contents:read`, `pages:write`, and `id-token:write`; use `npm ci`, tests/build, artifact upload from `dist`, and an appropriate concurrency rule.
6. Confirm local build and file-based loading. Investigate Pages settings and deployment permissions. If publishing is currently blocked, record the exact issue **but continue with Phase 2**.

**Gate:** source project, dev server, tests command, production build, and local HTML smoke test function. Deployment configuration exists; remote deployment can remain explicitly pending external approval until Phase 6.

### Phase 2 — Pure mathematical engine and independent analytic tests

Implement named models for the main paraboloid, cylinder example, and optional `y³` counterexample. Provide values, parameterizations, derivatives, gradients, tangent vectors, directional derivative, projections, 3D positions, and analytically known critical points. Keep computation browser-independent and avoid redundant formulas in visual components.

**Gate:** Vitest checks known values for main example at `t=1`, `t=5/3`, `t=2`; all four critical points of the cylinder example; identity `g(r(t))=c`; identity `h'(t)=∇f·r'(t)`; identity `∇g·r'(t)=0`; gradient projection zero at optimum; negative multiplier cases; and zero-gradient handling. Expected values must come from **independent analytic derivations**, not from a second call to the same possibly broken implementation.

### Phase 3 — Scene I: surface and feasible path

Implement the interactive 3D paraboloid, vertical plane `x+y=3`, highlighted spatial intersection curve, synchronized marker, 1D height profile, and deterministic control of parameter `t`. Add a compact mode showing two vertical coordinate sections with their tangent vectors and `f_x`, `f_y`. 3D camera rotation must not interfere with dragging the mathematical point; move the point primarily through the 2D/profile control.

**Gate:** browser-based interaction verifies that all representations agree, the marker stays feasible, `t=1` and `t=5/3` are visually/mathematically correct, sections update correctly, reset works, and meaningful screenshots are inspected (not just produced).

### Phase 4 — Scene II: the core geometric proof

Implement top-down 2D level sets, the constraint line, feasible point, tangent `T`, `∇f`, the **tangential projection of `∇f`**, `∇g`, synchronized derivative/profile, and deliberately staged reveal of the mathematical reasoning. The user must see the tangent projection change sign and vanish while `∇f` remains nonzero, then see why both gradients are perpendicular to the same tangent. Only then show `∇f=λ∇g`.

This is the **highest-priority quality gate**. Do not substitute an animation of two parallel arrows for the proof. Respect equal x/y scales and correct arrow directions, including negative multipliers if shown in the right context. Use an on-screen progression consistent with the six-minute core time budget.

**Gate:** test key positions before/at/after `t=5/3`, projection formulas, values, step toggles, reset, alignment between text and geometry, and browser screenshots. Fix visual ambiguities before continuing.

### Phase 5 — Scene III and coherent single-page article

Create the 3D surface/cylinder intersection, feasible circle, spatial trajectory, synchronized `h(t)`, and four stationary points. In the mandatory 90-second route, contrast local maximum `(-1,0)` (height `0`) with global maximum `(1,0)` (height `2`); hide longer computations in the optional section. Add the `y³` non-extremum counterexample as a compact optional mode, not a fourth main scene.

Compose the complete Russian single-page narrative: problem, surface, short partial-derivative mode, geometric derivation, Lagrangian/system and solved main example, cylinder, recap, collapsible extras. Do not repeat the proof twice. Make text, charts, formulas, colors, and interaction sequencing coherent. Preserve user-friendly linkable section anchors; no extra HTML pages or routes.

**Gate:** all scenes and prose in one page; all mandatory material accessible by scrolling; optional material hidden initially; behavior/state isolation and responsive layout tested in browser at approximately `1440×900`, `1280×800`, and a narrow/mobile-like viewport; no blocking overlap, missing math glyphs, or nonworking controls.

### Phase 6 — Independent audit, offline and production deployment

1. Run the full math/unit/browser suite, fix issues, inspect screenshot output for all three scenes and special states.
2. Build the final `dist/index.html`. Inspect the dist directory: it must contain the single required HTML without extra required assets. Audit any HTTP/resource dependencies, inline scripts/style/fonts and dynamic chunks.
3. **Actually open `dist/index.html` via `file://` in a browser with network disabled/blocked**, if tooling supports it. Verify equations, all three scenes, interactions, reset, and console. Do not call a `localhost` check an offline `file://` test.
4. Check GitHub Pages workflow correctness; if authorized, commit/push or open a PR as appropriate. If the environment allows updating `main` and Pages is configured, deploy the built artifact from `dist` through Actions. Do not assume a PR or local commit publishes to `main`.
5. Verify the actual public URL `https://michael-malis.github.io/lagrange-multipliers/`, preferably with a build/commit identifier to avoid mistaking cached previous content for the new version. Test HTTP response, loaded version, math rendering, all scenes, at least one interaction in each, and console/network errors. GitHub Pages may take some time to reflect updates: use bounded retries rather than one immediate fetch.
6. Distinguish the **scripted 18-minute run-of-show** from actual educational timing. A human dry run is needed to confirm spoken duration and comprehension; mark it as pending if it was not performed by a person.
7. Update `README.md` to describe actual build/test commands and publish URL. Update all status/acceptance docs with observed evidence and unresolved limitations. Produce a crisp final report.

**Gate:** Do not declare *fully deployed and verified* unless the published current site was actually inspected and functionality verified. If the only blocker is user GitHub action, declare *implementation complete, deployment pending* and provide exact UI steps (for example, `Settings → Pages → Build and deployment → Source → GitHub Actions`, or merging a specific PR). Do not claim the human timing criterion has been confirmed automatically.

## 7. Verification matrix (minimum)

**Math:** true reference values; chain rule; constraints; gradients; signs; 2D unit-scale; `λ<0`; regularity caveat; stationary is not necessarily optimum.

**Interaction:** point constrained to path, linked 2D/3D/1D readouts, camera controls, stepwise reveal, reset, click/drag/touch or keyboard fallback, state isolation.

**Visual:** image-based review for initial and revealed states, main optimum, projected gradient disappearance, cylinder local/global extrema; at least a common desktop and narrower breakpoint. No axes distortion, clipped formulas, hidden markers, unintentional overlay, or misleading transparency.

**Offline:** one `dist/index.html`; direct `file://`; no network/CDN and no missing KaTeX font assets. If testing environment cannot disable the network, disclose that and at least audit URLs and block requests when possible.

**Publication:** Pages Actions configured and runnable, actual site content matched to current commit, loaded site interactions verified, no broken URLs. Do not assume setting permissions from GitHub Actions config magically enables Pages in repository settings.

**Educational:** approved 18-minute route, 2-minute reserve, single derivation, three principal scenes, optional extras not mandatory, explain *why* rather than rote formula.

## 8. Completion and reporting contract

Track the following per phase in `docs/PROGRESS.md`:

- `Status`: pending / running / passed / blocked / pending-external-verification
- `Artifacts`: created/changed files
- `Commands run` and **observed** results
- `Decisions` and deviations from spec, if any
- `Remaining risks` and what comes next

Keep records compact. Resume from these files if context gets compacted or an execution session restarts; do not reset progress or accidentally repeat finished phases. When a phase is locally complete, move on automatically without waiting for a user response.

At the end, report:

1. Local implementation and test status.
2. Six phase outcomes, each with actual verification evidence.
3. Exact source branch/commit/PR (if any), and whether changes reached `main`.
4. Offline artifact location and `file://` test status.
5. GitHub Pages URL and whether the current version was **actually verified**.
6. Exact manual actions (only if unavoidable).
7. Any remaining issues, especially human timing/comprehension verification.

**Do not stop after writing documentation or a placeholder.** Deliver the full site to the extent access and tools permit, using the six gates as an internal workflow rather than six separate user requests.
