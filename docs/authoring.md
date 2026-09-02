# Desktop authoring guide

## Customization contract

Melly desktop authors work in HTML, CSS, and JavaScript. Standard DOM, event, module, form, accessibility, and styling behavior should remain recognizable wherever the embedded engine supports it. Melly-specific desktop behavior should appear as a small, host-neutral extension vocabulary—semantic `melly.*` APIs and, where justified, HTML elements, attributes, CSS semantics, or events.

Melly guarantees programmability for the interface surface and semantic operations in its contract. Direct control over other compositor, application, device, and Linux behavior is outside the contract. Desktop code must:

- rely on the eventual versioned minimum Melly environment for required behavior;
- feature-detect documented optional capabilities;
- handle unsupported or failed operations with an explicit user-visible state;
- remain understandable and navigable in browser preview without native authority;
- avoid branching on Sway, raw Wayland objects, or another backend's internal representation.

Visual layout, styling, bindings, and interaction belong in HTML/CSS/JavaScript. Installation metadata and permission declarations may describe entry points and authority, but should never be required to express the look or ordinary behavior of the desktop.

## Managed versus host-managed applications

Not every runnable application is necessarily mediated by Melly. Native cases supported by the active runtime may be Melly-managed and participate in the documented window model. Legacy X11 applications—and any case the current runtime cannot proxy safely—may instead be routed directly to the host compositor and remain host-managed.

Host-managed means allowed and usable where the host supports it, not supported by the full Melly contract. Do not assume such an application receives HTML window chrome, appears in managed window collections, emits Melly lifecycle events, or accepts Melly window operations. If a future API exposes host-managed applications diagnostically, feature-detect that limited contract and label unavailable controls honestly.

## Development loop

Serve the repository with any static HTTP server and edit the source directly:

```sh
python3 -m http.server 8080
```

Refresh the browser during this pre-runtime phase. The planned `melly dev` command will watch the working tree, debounce changes, and reload the document or affected WebView without compiling the native runtime or restarting the desktop session.

## Component model

Each component keeps markup, styling, and behavior under one directory. The reference components load adjacent HTML and CSS from an ES module and render them in Shadow DOM. This is a lightweight convention, not a required framework or a custom JSX toolchain.

Components coordinate through documented DOM events:

- `melly:launcher-open` asks the launcher to show;
- `melly:notice` carries user-visible status text;
- `melly:workspace-active` reports the active workspace in the preview mock.

Native operations do not use these events. They call the permission-checked `melly.*` API described in `native-api.md`.

## Adding a component

1. Create `components/<name>/<name>.html`, `.css`, and `.js`.
2. Define a uniquely named custom element in the module.
3. Load the module from `scripts/desktop.js` or a parent component.
4. Use semantic markup and support keyboard interaction and visible focus.
5. Render native strings with `textContent`, not HTML interpolation.
6. Handle missing capabilities and API failures with an operable, user-visible degraded state.
7. Add any new native authority explicitly to `melly.toml` and document why it is needed.

## Browser preview versus Melly

The preview installs a small `globalThis.melly` mock only when a native object is absent. It simulates app launches and workspace activation. Do not branch production UI behavior on mock internals: code against the documented API and capability checks so the same source can run under the native runtime.

An object named `melly` may be the native bridge or the browser-preview mock. A future versioned environment-discovery method is used alongside operation-level feature detection. Until then, missing methods, absent capabilities, and structured unsupported errors lead to explicit preview/degraded behavior.

## Git activation model

During development, a saved file is expected to reload quickly. In deployed mode, a commit is a candidate generation: Melly validates its manifest, sources, and permissions, initializes it separately, and activates it only after a health check. Keep commits focused so changes remain reviewable and rollback remains meaningful.
