# v05 source, build, and deploy

## Canonical source

The active v05 source is the `vnext/text-mud-ui-v04` lineage:

- application: `new-media-time-simulator/`
- v05 source: `new-media-time-simulator/src/v05/`
- v05 tests: `new-media-time-simulator/src/v05/tests/`

`gh-pages/v05/` is generated output only. Do not edit its hashed assets.

## Reproducible route

1. Start from `v05.1/core-hardening` (or its merged successor).
2. In `new-media-time-simulator/`, run `npm ci` then `npm run verify:v05`.
3. The `v0.5 World Hub CI` workflow builds and smoke-tests the source branch.
4. Only that workflow publishes `dist/` to `gh-pages/v05/`.

The deployed asset is traceable to the commit that triggered the workflow. A source-version stamp is the next deployment hardening task; no generated asset is a source-of-truth.
