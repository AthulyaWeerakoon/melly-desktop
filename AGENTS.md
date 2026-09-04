# Repository guidance for contributors and coding agents

These instructions apply to the entire `melly-desktop` repository.

## Purpose

This is a portable single-page desktop application for Melly. It contains user-interface source and a draft manifest, not the Rust runtime, a compositor configuration, or a general website.

## Required invariants

1. Keep the baseline in plain HTML, CSS, and JavaScript with native ES modules. Do not require npm, a framework, JSX, a bundler, or generated assets for normal use.
2. Route native intent only through the `melly.*` namespace. Do not call Sway IPC, compositor commands, D-Bus, or arbitrary shell commands from desktop code.
3. Check capabilities before exposing optional controls, and keep the desktop usable when an operation is unavailable.
4. Do not add permissions silently. Explain new authority in `melly.toml`, `docs/manifest.md`, and the change description.
5. Keep every Melly implementation viewable as ordinary HTML, CSS, and JavaScript in a standard browser served from the local checkout. Native integration may enhance the implementation but must not be required to render, navigate, or understand its baseline interface.
6. Make every deployed interface self-contained and offline-capable. Runtime-loaded online assets and remote source dependencies are strictly forbidden.
7. Treat filesystem and network access as explicit capabilities. Asynchronous JavaScript follows the same offline-only dependency policy as synchronous code.
8. Preserve keyboard operation, visible focus, semantic markup, readable contrast, reduced-motion preferences, and operable empty/error states.
9. Keep the browser mock clearly separated from the native contract. Production behavior must not depend on mock-only properties.
10. Keep visual structure, styling, bindings, and interaction behavior in HTML, CSS, and JavaScript. Package metadata may identify entry points and request authority, but it must not grow into a second desktop-authoring language.
11. Describe only behavior the runtime can guarantee. Experimental elements, methods, events, proxy behavior, and host integrations must remain clearly marked as drafts until implemented, tested, and versioned.
12. Do not assume every application visible on the host is Melly-managed. X11 and other safely bypassed applications remain host-managed and usable but must not be presented as having Melly chrome, events, or control unless an explicit limited contract says so.
13. Write repository documentation declaratively. State the design, contract, status, constraints, and validation criteria without persuasive comparisons, editorial opinions, or explanations of why a decision is superior.
14. Keep the desktop a single-page application. `index.html` bootstraps one persistent document; navigation, view changes, and state transitions occur within that document rather than through page reloads.
15. Use native ES modules and standards-based custom elements as the primary code boundaries. Give custom elements descriptive hyphenated tags and keep their modules easy to locate from the tag names so markup remains readable and implementation code remains navigable.

## Browser-first environment behavior

- `globalThis.melly` is the canonical native bridge. Future contracts may add environment discovery such as `await melly.getEnvironment()` and EventTarget-style APIs such as `melly.addEventListener(...)`; those names remain drafts until `docs/native-api.md` ratifies them.
- Feature-detect the bridge operation actually needed. Treat an object named `melly` as either the native bridge or the limited browser-preview mock until environment discovery confirms it.
- Use the normal preview behavior whenever the bridge, environment-discovery method, capability, or requested operation is missing, unsupported, rejects, or reports a non-Melly environment.
- A preview fallback must remain operable and must state clearly that no native action occurred. For example, an unavailable launch request should produce `Preview only: launching Terminal…` or equivalently explicit wording.
- Never replace the preview fallback with a blank state, uncaught exception, silent no-op, or direct compositor/shell workaround.
- Keep native calls asynchronous where appropriate and handle their failures at the user-interface boundary. Browser rendering remains available before and without a successful native call.

## Offline-only asset policy

- Every file needed to render or operate the desktop must already exist in the repository or in a locally installed Melly package directory. Store vendored third-party material in a documented repository path such as `packages/<package>/`.
- Any resource referenced by HTML `href` or `src`, JavaScript static or dynamic `import`, `fetch`, XHR, workers, CSS `@import`, `url()`, fonts, images, audio, or video must resolve to a local relative or approved package-local path.
- `http://`, `https://`, protocol-relative `//`, CDN, remote font, remote image, remote stylesheet, remote script, and remote module references are strictly forbidden in deployable HTML, CSS, JavaScript, and manifests. Do not add an online fallback for a missing local asset.
- Download third-party assets during an explicit authoring/vendor step, place them locally, and record their source, version, and license. Normal preview, validation, deployment, startup, and use must not need that origin server.
- Calls to the local `melly.*` bridge may be asynchronous. This exception does not permit fetching executable code, styles, fonts, icons, images, templates, or other interface assets from the network.
- Treat a remote asset reference as a deployment-blocking defect. Melly's future validator is expected to reject it; contributors and coding agents must enforce the rule before that validator exists.

## Working conventions

- Preview through a local HTTP server; component modules fetch adjacent HTML and CSS files.
- Keep all such fetches and module imports relative and local; verify new markup, styles, and scripts contain no remote resource URLs.
- Keep each component's markup, styles, and behavior together under `components/<name>/`.
- Define interface components as custom elements with descriptive tags, and keep each tag's registration in its corresponding component module.
- Use custom events for loose component coordination and document new event names.
- Avoid global CSS selectors for component internals; current components use Shadow DOM.
- Escape or assign untrusted values with `textContent`; do not interpolate native data into `innerHTML`.
- Run JavaScript syntax checks and exercise launcher keyboard behavior after UI changes.

The manifest and native API are drafts until the Rust runtime implements and versions them. Update their documentation alongside contract changes.
