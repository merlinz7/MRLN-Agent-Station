# MRLN Agent Station — fork development notes

This repository is an in-progress fork of [StarNet](https://github.com/androoAGI/starnet).

## Current state

- The original agent runtime, station renderer, world builder and animated skin picker are inherited from upstream.
- The MRLN title-screen and chrome wordmark are original graphics in `frontend/assets/brand/mrln-wordmark.svg`.
- This branding work does **not** replace or relicense upstream station/character art, nor does it turn the fork into a finished standalone product.
- The original MIT copyright and attribution remain in `LICENSE` and `NOTICE.md`.
- The upstream subscription, account linking, updater URLs, app IDs and release infrastructure are **not** MRLN services. Do not present them as MRLN functionality or release a public installer until they have been reviewed and appropriately replaced or disabled.

## Character selection and animated sprites

The inherited picker already runs an animated walk preview via `frontend/app/skinstage.js`. The registry is `frontend/app/data-shim.js`, and sprite tracks are loaded from `frontend/assets/sprites/manifest.json`. The same animation frames feed the live station via `frontend/js/assets.js`.

The MRLN character work should therefore introduce original character sprites compatible with this existing interface, rather than rebuilding it or linking mockup graphics.

## Roadmap and acceptance gates

1. Replace every *product* wordmark and screen title with MRLN while preserving labels for actual external providers such as StarNet accounts.
2. Produce license-cleared original character sets with complete directional idle/walk/work tracks; preview and in-world body must match.
3. Produce original room/furniture/world assets at the existing renderer's authored dimensions, and keep the existing geometry/pathfinding/bake code.
4. Audit upstream artwork, provider links, app identities, telemetry and updater settings before any public release.
5. Run `npm run test:fast`, `npm run test:http`, animation/render tests and Windows desktop packaging checks.

Until these gates pass, treat this as a development fork. No claim of completed independent assets, full rebrand or Windows release is made.
