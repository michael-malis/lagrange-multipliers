# Repository guidance

- Read `docs/SPEC.md` for product/math requirements and `CODEX_MASTER_PROMPT.md` for execution gates.
- Keep exactly three main scenes and the 18-minute Russian lesson. Do not change the approved examples.
- Keep mathematics pure in `src/math/`; views consume the same computed state.
- After each phase run relevant tests, fix failures, update `docs/PROGRESS.md`, then continue automatically.
- Build one self-contained `dist/index.html`, including fonts. Verify directly via offline `file://`.
- Deploy from existing `main` with GitHub Actions. Never force-push or discard unrelated changes.
- Distinguish build success, deployment success, and actual public browser verification.
- Human timing/comprehension cannot be certified by automated tests.
