# MRLN independent-release evidence

**Status: NOT CLEARED FOR PUBLIC COMMERCIAL DISTRIBUTION.**

The MIT license permits use, modification, and distribution of the covered *code*. StarNet's excluded original graphical assets, character sprites, logos and any third-party media must be reviewed separately. A visually convincing fork is not automatically a separately marketable product.

## Verified first-party work in this fork

- \`frontend/app/mrln-crew-art.js\`: original source-generated 24-character catalog, eight-direction walk/idle/sit/type/talk. The drawings are original geometric sprites, but a screenshot and quality acceptance are still required.
- \`frontend/app/mrln-materials.js\`: original canvas-generated station floors and wall panels. It does not replace every inherited mesh, prop, machine, or UI image.
- \`frontend/assets/brand/mrln-wordmark.svg\`: originally authored MRLN wordmark.
- \`scripts/mrln-stage-windows.mjs\`: original Windows branding/installer image generation.

## Blockers for an independent release

1. Identify and either replace or obtain verifiable rights for inherited raster/vector media under \`frontend/assets/\` (including \`sprites/\`, \`industrial/\`, \`furniture/\`, \`brand/\` and embedded screenshots).
2. Keep the upstream MIT LICENSE and attribution notices for retained code.
3. Audit visible StarNet wording and branding independently of internal legacy identifier names.
4. Isolate app IDs, credentials, user workspaces, updater/signing endpoints, accounts, URLs and service metadata.
5. Pass the complete MRLN app tests, installed-Windows test, visual comparison and offline model test. The upstream StarNet release-claims snapshot is not transferable evidence for MRLN.
6. Do not silently remove inherited images from a build if code still requires them. Generate a first-party replacement set and test every affected UI and station mode.

## Executable checks

Internal report (does not assert clearance):

\`\`\`bash
node scripts/mrln-release-assets.mjs
\`\`\`

Public release gate (expected to **fail** until all media is cleared):

\`\`\`bash
node scripts/mrln-release-assets.mjs --strict-public
\`\`\`

The resulting machine-readable inventory is written to \`.mrln-audit/assets.json\`, with relative paths and sizes. **Unverified assets must remain blocking**, not be classified as first-party merely because a fork copies or recolors them.

## Current release decision

Use GitHub's unsigned Windows artifacts for *internal testing only* while remaining rights/branding checks are open. Do not publish them as a commercially licensed, fully independent MRLN product.
