# Cropo Roadmap

This document tracks the path from the current modernized `0.6.x` line to a stable
`1.0.0` release.

## Where we are: `0.6.0` (tooling & maintenance refresh)

The library code (`script.ts`) is unchanged in behavior, but the project around it has
been brought back up to date after a long pause:

- **Build**: migrated from the unmaintained `microbundle` to **tsup** (esbuild based).
  Outputs ESM (`dist/script.js`), CommonJS (`dist/script.cjs`), an IIFE/global build
  (`dist/script.global.js`) for `<script>`/CDN usage, plus type declarations.
- **TypeScript**: added an explicit `tsconfig.json` with `strict` mode enabled and an
  `npm run typecheck` script. The source was updated to satisfy strict null/initialization
  checks (definite-assignment assertions, null-guards on `getContext`/`toBlob`).
- **Linting**: migrated to **ESLint 9 flat config** (`eslint.config.mjs`) with
  `typescript-eslint`, replacing the legacy `.eslintrc.json` + unmaintained
  `eslint-config-standard`.
- **Tests**: introduced **Vitest** (`jsdom` environment) with an initial suite covering
  construction, crop-info math, panning/clamping, and export guards.
- **CI**: a single `ci.yml` runs typecheck + lint + test + build on every push/PR (Node 20);
  `npm-publish.yml` runs the same gate before publishing. Deprecated GitHub Actions were
  upgraded (`checkout@v4`, `setup-node@v4`, `codeql-action@v3`).
- **Reproducibility**: `package-lock.json` is now committed and CI uses `npm ci`.
- **Demo site** (`docsSrc/`): removed unused React and a hardcoded local-tarball dependency,
  fixed the build to install/run on any machine, and upgraded Parcel + Tailwind 3.

## The road to `1.0.0` (breaking changes)

`1.0.0` is the cleanup release that removes the long-deprecated compatibility layer. These
are **breaking** changes and must land together behind a major version bump, only after the
test suite covers the affected behavior.

### 1. Remove the deprecated function-style API

`script.ts` currently exports standalone functions (`download`, `loadCanvas`,
`loadImageFromUrl`, `loadSlider`, `move`, `getCropInfo`, `getDataUrl`) that proxy to a
single shared module-level `new Cropo({})` instance. They have carried
`@deprecated since 0.6` notices since 2022.

- Delete the function exports and the module-level `const cr = new Cropo({})`.
- This also removes a side effect on import (the shared instance currently constructs a
  canvas at module load), which is good for tree-shaking and SSR-safety.

**Migration for consumers:**

```ts
// Before (deprecated function API)
import { loadCanvas, loadImageFromUrl, download } from 'cropo'
loadCanvas(canvasEl)
loadImageFromUrl(url)
download()

// After (class API)
import { Cropo } from 'cropo'
const cropo = new Cropo({ canvas: canvasEl, imageUrl: url })
cropo.download()
```

### 2. Make constructor options required

The constructor options object is currently fully optional (`options?: { ... }`) — see the
`// TODO: remove optional from version 1.0.0` marker in `script.ts`. For 1.0:

- Require the options object, and require at least a `canvas` (or document the canvas it
  creates). Keep individual tuning fields (`maxScale`, `fit`, etc.) optional.
- Remove the `// TODO` once done.

### 3. Tighten and expand tests before the cut

- Add coverage for zoom (`zoomScale`/`zoomDelta`), slider input, and the export paths
  (`getDataUrl`/`getBlob`) using the canvas stubs already in `test/setup.ts`.
- These guard the behavior that the API cleanup must preserve.

## Possible follow-ups (post-1.0, not committed)

- Tailwind 4 upgrade for the demo (CSS-first config) — deferred to avoid churn now.
- Replace the manual `docsSrc/test.tsx` demo wiring with a small typed entry, or document it.
- Consider publishing with npm provenance (`--provenance`) from CI.
