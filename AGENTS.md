# Repository guidance for contributors and coding agents

These instructions apply to the entire `melly-desktop` repository.

## Purpose

This is a portable desktop source package for Melly. It contains user-interface source and a draft manifest, not the Rust runtime, a compositor configuration, or a general website.

## Required invariants

1. Keep the baseline in plain HTML, CSS, and JavaScript with native ES modules. Do not require npm, a framework, JSX, a bundler, or generated assets for normal use.
2. Route native intent only through the `melly.*` namespace. Do not call Sway IPC, compositor commands, D-Bus, or arbitrary shell commands from desktop code.
3. Check capabilities before exposing optional controls, and keep the desktop usable when an operation is unavailable.
4. Do not add permissions silently. Explain new authority in `melly.toml`, `docs/manifest.md`, and the change description.
5. Prefer local repository assets. Treat filesystem and network access as explicit capabilities.
6. Preserve keyboard operation, visible focus, semantic markup, readable contrast, reduced-motion preferences, and useful empty/error states.
7. Keep the browser mock clearly separated from the native contract. Production behavior must not depend on mock-only properties.

## Working conventions

- Preview through a local HTTP server; component modules fetch adjacent HTML and CSS files.
- Keep each component's markup, styles, and behavior together under `components/<name>/`.
- Use custom events for loose component coordination and document new event names.
- Avoid global CSS selectors for component internals; current components use Shadow DOM.
- Escape or assign untrusted values with `textContent`; do not interpolate native data into `innerHTML`.
- Run JavaScript syntax checks and exercise launcher keyboard behavior after UI changes.

The manifest and native API are drafts until the Rust runtime implements and versions them. Update their documentation alongside contract changes.
