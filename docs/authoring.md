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

## Sandbox and desktop root

The desktop root is the directory containing the manifest entry document, currently `index.html`. Every document, module, worker, stylesheet, component template, font, image, audio file, video file, and other interface resource must resolve to a regular package file inside that root. Absolute filesystem paths, parent traversal, symlinks escaping the root, and redirects or alternate path spellings that resolve outside it are invalid.

Desktop JavaScript can change the rendered DOM and its own in-memory state. It cannot directly alter desktop source files, arbitrary host files, processes, services, compositor state, or machine configuration. Native effects are available only through documented, permission-checked `melly.*` operations. The runtime and renderer must keep filesystem, process, socket, and native-object handles out of the page unless a specific API contract grants constrained access.

AJAX is a separate network capability. With explicit permission, a desktop may use `fetch` or XHR to exchange data with approved localhost or outbound endpoints. Network responses remain untrusted data and cannot become executable code, imported modules, styles, markup, fonts, images, templates, or other interface assets. The desktop must retain an offline-operable baseline.

A separately installed localhost service may act on an authorized request and may modify desktop or other files according to that service's own operating-system identity and permissions. The request grants no Melly authority to the service, and the service does not run with or inherit privileges held by the Melly runtime. Localhost access is still permission-gated network access and must not be treated as trusted merely because it is local.

Candidate validation and runtime resource loading must enforce the same canonical root boundary. Validation must cover parent traversal, absolute paths, symlink and hard-link handling, redirects, encoded path variants, race-resistant resolution, and every resource-loading mechanism supported by the embedded engine.

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

`index.html` contains one application root, `<melly-desktop-app>`. The bootstrap installs the browser-preview boundary when needed and imports the component modules. Page navigation, desktop switching, tool opening, and window changes happen without replacing the document.

Each component keeps markup, styling, and behavior under one directory. The reference components load adjacent HTML and CSS from an ES module and render them in Shadow DOM. `scripts/core/component-loader.js` owns that local loading behavior so components do not duplicate it.

The central store owns desktop tabs, tool-window records, focus, z-order, bounds, window mode, and interface preferences. Leaf components receive state snapshots and emit intent events; they do not mutate the shared model or call one another. `melly-desktop-app` handles those events, updates the store, and routes native application requests through `scripts/services/melly-client.js`.

Components coordinate through documented DOM events:

- `melly:desktop-activate` and `melly:desktop-add` change local desktop tabs;
- `melly:window-focus`, `melly:window-close`, `melly:window-move`, and `melly:window-maximize-toggle` describe window intent;
- `melly:tool-open` opens a built-in HTML tool;
- `melly:application-launch` requests a native application through the client service;
- `melly:launcher-open` and `melly:launcher-close` control the application launcher;
- `melly:preference-update` changes validated in-memory interface preferences;
- `melly:notice` carries user-visible status text.

These events are internal component intent, not native authority. The root coordinator performs native operations through the permission-checked `melly.*` boundary described in `native-api.md`.

## Adding a component

1. Create `components/<name>/<name>.html`, `.css`, and `.js`.
2. Define a uniquely named custom element in the module.
3. Load the module from `scripts/desktop.js` or a parent component.
4. Use semantic markup and support keyboard interaction and visible focus.
5. Render native strings with `textContent`, not HTML interpolation.
6. Handle missing capabilities and API failures with an operable, user-visible degraded state.
7. Add any new native authority explicitly to `melly.toml` and document why it is needed.

For a built-in windowed tool, also add one entry to `scripts/catalog/tools.js`. Its stable tool ID, custom-element tag, title, icon, preferred size, and instance policy let the window manager compose it without adding tool-specific branching to the application shell.

Desktop tabs are local Melly interface state and are not assumed to equal Sway or host workspaces. Windows remain assigned to their desktop while another tab is active. A future native mapping must use the host-neutral workspace contract rather than parsing or exposing compositor identifiers.

## Browser preview versus Melly

The preview installs a small `globalThis.melly` mock only when a native object is absent. It simulates app launches and workspace activation. Do not branch production UI behavior on mock internals: code against the documented API and capability checks so the same source can run under the native runtime.

An object named `melly` may be the native bridge or the browser-preview mock. A future versioned environment-discovery method is used alongside operation-level feature detection. Until then, missing methods, absent capabilities, and structured unsupported errors lead to explicit preview/degraded behavior.

## Git activation model

During development, a saved file is expected to reload quickly. In deployed mode, a commit is a candidate generation: Melly validates its manifest, sources, and permissions, initializes it separately, and activates it only after a health check. Keep commits focused so changes remain reviewable and rollback remains meaningful.
