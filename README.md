# MRLN Agent Station

**A local-first desktop agent station — a development fork of [StarNet](https://github.com/androoAGI/starnet).**

This repository contains the MRLN fork source and its CI-built Windows test installers. It is **not** a public, security-audited product release yet.

> **Looking for the Windows app? Do not use GitHub’s “Code → Download ZIP.”**
> That button downloads **source code**, not an installer.

## Download the Windows internal test build

1. Open **[MRLN Windows test builds (GitHub Actions)](https://github.com/merlinz7/MRLN-Agent-Station/actions/workflows/mrln-windows-build.yml)**.
2. Select the newest run marked with a **green check**. Make sure it was built from the branch you want to test.
3. At the bottom of the run page, under **Artifacts**, download `mrln-windows-internal-test-<run number>`.
4. Unzip that artifact and launch `MRLN Agent Station_0.13.2_x64-setup.exe` (the actual version may change).
5. Open MRLN Agent Station from the Windows Start menu.

GitHub may require you to sign in to download an artifact. CI retains these **temporary internal artifacts for seven days**. The Windows build is **unsigned**; treat any OS warning seriously and verify that it comes from your own GitHub Actions run.

**An installer build passing does not alone prove that the installed app launched.** Prefer runs where the **Install and launch built MRLN** job step passed, and review its `mrln-installed-smoke-<run number>` receipt.

For a live screenshot, consult the independent **[real-station visual proof workflow](https://github.com/merlinz7/MRLN-Agent-Station/actions/workflows/mrln-visual-proof.yml)**. These are actual CI captures rather than concept mockups.

## What this fork currently includes

- The upstream StarNet multi-agent runtime, local tools, agent communication, persistence, and station simulation.
- MRLN logo, UI colors and Windows application identity, with a separate app data location and OS keychain namespace.
- A set of **40 original MRLN character variants** across six archetypes (eight-direction walking animation, work, speech and idle states), integrated with the existing picker and world renderer.
- Procedurally generated MRLN floor and wall materials and a five-sector studio template.
- **MRLN · ION VEIL**: original parallax space background with cyan/violet/amber nebula, stars and survey lattice, integrated into the real station and backdrop selector. New stations default to Ion Veil; saved stations retain their own selected sky.
- A disabled automatic updater: MRLN must **not** install updates from StarNet's separate release feed.
- GitHub checks for sprite/material generation, data isolation, rendered station screenshots, and installed Windows launch.

Existing saved agents may still be using old StarNet skins until you explicitly choose an MRLN character for them. Preserving user selections is intentional.

## Important limitations — read before sharing

**Internal test use only.** The fork still contains inherited StarNet graphical assets, artwork and service integrations. The upstream **MIT license covers source code**; it does **not automatically clear upstream art, sprites, trademarks, or account/service branding for independent distribution**. An additional clearance/replacement pass is required before commercial or public release.

Some provider routes still explicitly connect to external StarNet services; they are **not** MRLN subscription plans. The original runtime's internal names may remain as compatibility keys.

**The inherited StarNet release-claims test suite is still not green.** It includes immutable upstream release inventories and migration assumptions. We are auditing and adapting those checks rather than disabling privacy/security tests or reporting a false pass.

A passing screenshot and 15-second installed-launch test **do not** prove that every model, connector, schedule, tool permission, and end-to-end agent task works on every user's computer.

MRLN does not silently import, modify or erase a separate StarNet installation's workspace or credentials. Back up your own MRLN data before experimenting with development builds.

## Development

This repository contains the original multi-component project: JavaScript/Node.js sidecar, browser frontend and Tauri/Rust native desktop shell.

For development, use **Node.js 22** and a Windows Tauri/Rust toolchain. The CI workflow is the authoritative reproducible Windows build recipe: [`.github/workflows/mrln-windows-build.yml`](.github/workflows/mrln-windows-build.yml).

Common standalone checks:

```sh
npm ci
node test/mrln-crew-art.test.js
node test/mrln-materials.test.js
node test/mrln-brand-integration.test.js
node test/datareset.test.js
```

The full upstream test suite can be run using `npm run test:fast`, but a red result must be investigated; it is not automatically caused by the new graphics.

## Attribution and licenses

MRLN Agent Station derives from **[StarNet by Andrew Sims and contributors](https://github.com/androoAGI/starnet)**. The underlying source is MIT licensed, with relevant attribution preserved in [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md). Original MRLN artwork and code additions are documented in [docs/MRLN_FORK_NOTES.md](docs/MRLN_FORK_NOTES.md).

Do not remove original copyright or license statements from reused code. Commercial redistribution requires separate review of excluded upstream and third-party art.

## Project status

The current development occurs across reviewable GitHub pull requests. A pull request being open does **not** mean its code has passed all gates or been merged into the default branch. Download a **known green Actions artifact**, not the default branch ZIP, when testing the Windows executable.
