# SPA architecture

Melly Desktop is one persistent HTML document rooted at `<melly-desktop-app>`. Native ES modules register standards-based custom elements. View changes, desktop-tab switching, tool opening, and window operations update in-memory state without full-page navigation or document reloads.

## Runtime shape

```text
index.html
    |
scripts/desktop.js
    |
    +-- browser/native melly.* client boundary
    +-- component registrations
    |
<melly-desktop-app>             root coordinator
    |
    +-- <melly-panel>
    |       +-- <melly-desktop-tabs>
    +-- <melly-desktop-surface>
    |       +-- <melly-window-manager>
    |               +-- <melly-app-window>
    |                       +-- registered tool element
    +-- <melly-dock>
    +-- <melly-launcher>
    +-- <melly-toast>
```

## Ownership

- `scripts/state/desktop-store.js` is the single owner of desktop tabs, active desktop, window records, focus, z-order, bounds, window mode, and in-memory preferences.
- `scripts/catalog/tools.js` registers built-in tools and their custom-element tags. It is the extension point for windowed HTML tools.
- `scripts/services/melly-client.js` is the only application service that reads `globalThis.melly`. It normalizes native application records, handles unavailable operations, and supplies the browser-preview implementation.
- `scripts/core/events.js` defines the bubbling, composed intent-event vocabulary used across shadow boundaries.
- `scripts/core/component-loader.js` loads each component's adjacent local HTML and CSS.
- `melly-desktop-app` subscribes to the store, sends snapshots down to components, handles intent events, and invokes the client service.
- Leaf components render assigned state and emit intent. They do not directly change shared state or call other components.

## Desktop and window model

A desktop record contains an opaque local ID and display name. A window record contains:

```text
id, kind, toolId, title, icon, desktopId,
mode, zIndex, bounds { x, y, width, height }
```

Inactive desktops retain their window records. The window manager keeps keyed custom-element instances and hides those outside the active desktop, preserving tool-local DOM state while switching tabs.

Desktop tabs are Melly interface state, not host-compositor workspace identifiers. A future host mapping is an adapter-backed capability and does not change the component or store boundary.

`melly-app-window` currently supports focus, close, drag, and maximize/restore intent. Resize, minimize, tiling, persistence, and native managed-window representations can extend the window record and store operations without adding tool-specific logic to the window manager.

## Adding a built-in tool

1. Create `components/<tool-name>/<tool-name>.html`, `.css`, and `.js`.
2. Register one descriptive hyphenated custom element in the module.
3. Import the module from `scripts/desktop.js`.
4. Add its metadata to `builtInTools` in `scripts/catalog/tools.js`.
5. Keep tool state local unless multiple components need it; shared desktop state belongs in the store.
6. Emit a documented intent event for shared or native behavior. Do not access another component's shadow root.
7. Request native behavior only through the root service boundary and declare any new permission.

The window manager reads the registry, creates the tool element, and places it inside a reusable `melly-app-window` automatically.

## Built-in tools

Files uses an in-memory preview tree and explicitly reports that it has no host filesystem access. A future filesystem implementation uses a permission-checked `melly.*` API and preserves the same component boundary.

Settings changes only the SPA's in-memory appearance and window-presentation preferences. Machine and compositor settings remain unavailable until a documented native API, capability, and permission exist.

## Native applications

Catalog entries with `kind: "native"` are passed to the Melly client service. The service feature-detects `melly.apps.launch`, reports native failures, and uses explicit preview-only wording when no native operation occurs. Native applications are not rendered as built-in HTML tools.

## Validation

Run:

```sh
find scripts components -name '*.js' -print0 | sort -z | xargs -0 -n1 node --check
node --test tests/*.test.mjs
```

Then serve the repository locally and exercise keyboard navigation, desktop switching, tool opening, window focus/drag/maximize/close, launcher filtering and focus containment, and Settings changes. All module, template, stylesheet, and interface-resource paths remain relative and inside the desktop root.
